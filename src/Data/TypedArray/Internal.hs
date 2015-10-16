{-# LANGUAGE CPP #-}
{-# LANGUAGE MagicHash, UnboxedTuples, JavaScriptFFI, GHCForeignImportPrim, UnliftedFFITypes #-}
{-# LANGUAGE PolyKinds #-}
-----------------------------------------------------------------------------
-- |
-- Module      :  Data.TypedArray.Internal
-- Copyright   :  (c) Artem Chirkin
-- License     :  BSD3
--
-- Maintainer  :  Artem Chirkin <chirkin@arch.ethz.ch>
-- Stability   :  experimental
-- Portability :
--
-- JS imports used by typed arrays
--
-----------------------------------------------------------------------------

module Data.TypedArray.Internal where

import GHC.Exts (State#)
import qualified GHC.Exts as Exts

import Data.Word
import Data.Int
import Foreign.C.Types

import GHCJS.Types

import Data.TypedArray.Types



-----------------------------------------------------------------------------
-- Some simple functions -- the same for many types
-----------------------------------------------------------------------------

{-# INLINE arrayLength #-}
-- | Number of elements in the array
foreign import javascript unsafe "$1.length"
    arrayLength :: SomeTypedArray m a -> Int

{-# INLINE arrayBuffer #-}
-- | Get underlying ArrayBuffer
foreign import javascript unsafe "$1.buffer"
    arrayBuffer :: SomeTypedArray m a -> SomeArrayBuffer m


-----------------------------------------------------------------------------
-- Some not exposed js imports
-----------------------------------------------------------------------------

{-# INLINE js_byteLength #-}
foreign import javascript unsafe "$1.byteLength"
    js_byteLength :: JSVal -> Int

{-# INLINE js_createArrayBuffer #-}
foreign import javascript unsafe "new ArrayBuffer($1)"
    js_createArrayBuffer :: Int -> State# s -> (# State# s, SomeArrayBuffer m #)

{-# INLINE js_show #-}
foreign import javascript unsafe "$r = '[' + $1.join(', ') + ']'"
    js_show :: SomeTypedArray m t -> JSString



-- slice mutable any

{-# INLINE js_slice1 #-}
foreign import javascript unsafe
  "$2.slice($1)" js_slice1 :: Int -> JSVal -> State# s -> (# State# s, JSVal #)

{-# INLINE js_slice #-}
foreign import javascript unsafe
  "$3.slice($1,$2)" js_slice :: Int -> Int -> JSVal -> State# s -> (# State# s, JSVal #)


-- slice immutable any

{-# INLINE js_slice1_imm #-}
foreign import javascript unsafe
  "$2.slice($1)" js_slice1_imm :: Int -> JSVal -> JSVal

{-# INLINE js_slice_imm #-}
foreign import javascript unsafe
  "$3.slice($1,$2)" js_slice_imm :: Int -> Int -> JSVal -> JSVal


-----------------------------------------------------------------------------
-- All mutable data functions
-----------------------------------------------------------------------------

#define CREATEFUNCTIONS(T , JSName, JSArray, JSSize) \
foreign import javascript unsafe "new JSArray($1)" js_createM/**/T/**/Array :: Int -> State# s -> (# State# s, SomeTypedArray m T #); {-# INLINE js_createM/**/T/**/Array #-};\
foreign import javascript unsafe "new JSArray($1).fill($2)" js_fillNewM/**/T/**/Array :: Int -> T -> State# s -> (# State# s, SomeTypedArray m T #); {-# INLINE js_fillNewM/**/T/**/Array #-};\
foreign import javascript unsafe "JSArray.from(h$fromListPrim($1))" js_fromListM/**/T/**/Array :: Exts.Any -> State# s -> (# State# s, SomeTypedArray m T #); {-# INLINE js_fromListM/**/T/**/Array #-};\
foreign import javascript unsafe "JSArray.from($1)" js_fromArrayM/**/T/**/Array :: SomeTypedArray m0 t -> State# s -> (# State# s, SomeTypedArray m T #); {-# INLINE js_fromArrayM/**/T/**/Array #-};\
foreign import javascript unsafe "$3[$1] = $2" js_setIndex/**/T/**/Array :: Int -> T -> SomeTypedArray m T -> State# s -> (# State# s, () #); {-# INLINE js_setIndex/**/T/**/Array #-};\
foreign import javascript unsafe "$3.set(h$fromListPrim($2), $1)" js_setList/**/T/**/Array :: Int -> Exts.Any -> SomeTypedArray m T -> State# s -> (# State# s, () #); {-# INLINE js_setList/**/T/**/Array #-};\
foreign import javascript unsafe "$3.set($2, $1)" js_setArray/**/T/**/Array :: Int -> SomeTypedArray m0 t -> SomeTypedArray m T -> State# s -> (# State# s, () #); {-# INLINE js_setArray/**/T/**/Array #-};



CREATEFUNCTIONS(Int,Int32,Int32Array,4)
CREATEFUNCTIONS(Int32,Int32,Int32Array,4)
CREATEFUNCTIONS(Int16,Int16,Int16Array,2)
CREATEFUNCTIONS(Int8,Int8,Int8Array,1)
CREATEFUNCTIONS(Word,Uint32,Uint32Array,4)
CREATEFUNCTIONS(Word32,Uint32,Uint32Array,4)
CREATEFUNCTIONS(Word16,Uint16,Uint16Array,2)
CREATEFUNCTIONS(Word8,Uint8,Uint8Array,1)
CREATEFUNCTIONS(Word8Clamped,Uint8Clamped,Uint8ClampedArray,1)
CREATEFUNCTIONS(Float,Float32,Float32Array,4)
CREATEFUNCTIONS(Double,Float64,Float64Array,8)
CREATEFUNCTIONS(CChar,Int8,Int8Array,1)
CREATEFUNCTIONS(CSChar,Int8,Int8Array,1)
CREATEFUNCTIONS(CUChar,Uint8,Uint8Array,1)
CREATEFUNCTIONS(CShort,Int16,Int16Array,2)
CREATEFUNCTIONS(CUShort,Uint16,Uint16Array,2)
CREATEFUNCTIONS(CInt,Int32,Int32Array,4)
CREATEFUNCTIONS(CUInt,Uint32,Uint32Array,4)
CREATEFUNCTIONS(CLong,Int32,Int32Array,4)
CREATEFUNCTIONS(CULong,Uint32,Uint32Array,4)
CREATEFUNCTIONS(CFloat,Float32,Float32Array,4)
CREATEFUNCTIONS(CDouble,Float64,Float64Array,8)




-----------------------------------------------------------------------------
-- All immutable data functions
-----------------------------------------------------------------------------

#define JSTYPEDARRAY(T , JSName, JSArray, JSSize) \
foreign import javascript unsafe "new JSArray($1)" js_create/**/T/**/Array :: Int -> SomeTypedArray m T; {-# INLINE js_create/**/T/**/Array #-};\
foreign import javascript unsafe "new JSArray($1).fill($2)" js_fillNew/**/T/**/Array :: Int -> T -> SomeTypedArray m T; {-# INLINE js_fillNew/**/T/**/Array #-};\
foreign import javascript unsafe "JSArray.from(h$fromListPrim($1))" js_fromList/**/T/**/Array :: Exts.Any -> SomeTypedArray m T; {-# INLINE js_fromList/**/T/**/Array #-};\
foreign import javascript unsafe "JSArray.from($1)" js_fromArray/**/T/**/Array :: SomeTypedArray m0 t -> SomeTypedArray m T; {-# INLINE js_fromArray/**/T/**/Array #-};\
foreign import javascript unsafe "new JSArray($1)" js_view/**/T/**/Array :: SomeArrayBuffer m -> SomeTypedArray m T; {-# INLINE js_view/**/T/**/Array #-};\
foreign import javascript unsafe "$r = $1[$2]" js_index/**/T/**/Array :: SomeTypedArray m T -> Int -> T; {-# INLINE js_index/**/T/**/Array #-};\
foreign import javascript unsafe "$3.indexOf($2,$1)" js_indexOf/**/T/**/Array :: Int -> T -> SomeTypedArray m T -> Int; {-# INLINE js_indexOf/**/T/**/Array #-};\
foreign import javascript unsafe "$3.lastIndexOf($2,$1)" js_lastIndexOf/**/T/**/Array :: Int -> T -> SomeTypedArray m T -> Int; {-# INLINE js_lastIndexOf/**/T/**/Array #-};

JSTYPEDARRAY(Int,Int32,Int32Array,4)
JSTYPEDARRAY(Int32,Int32,Int32Array,4)
JSTYPEDARRAY(Int16,Int16,Int16Array,2)
JSTYPEDARRAY(Int8,Int8,Int8Array,1)
JSTYPEDARRAY(Word,Uint32,Uint32Array,4)
JSTYPEDARRAY(Word32,Uint32,Uint32Array,4)
JSTYPEDARRAY(Word16,Uint16,Uint16Array,2)
JSTYPEDARRAY(Word8,Uint8,Uint8Array,1)
JSTYPEDARRAY(Word8Clamped,Uint8Clamped,Uint8ClampedArray,1)
JSTYPEDARRAY(Float,Float32,Float32Array,4)
JSTYPEDARRAY(Double,Float64,Float64Array,8)
JSTYPEDARRAY(CChar,Int8,Int8Array,1)
JSTYPEDARRAY(CSChar,Int8,Int8Array,1)
JSTYPEDARRAY(CUChar,Uint8,Uint8Array,1)
JSTYPEDARRAY(CShort,Int16,Int16Array,2)
JSTYPEDARRAY(CUShort,Uint16,Uint16Array,2)
JSTYPEDARRAY(CInt,Int32,Int32Array,4)
JSTYPEDARRAY(CUInt,Uint32,Uint32Array,4)
JSTYPEDARRAY(CLong,Int32,Int32Array,4)
JSTYPEDARRAY(CULong,Uint32,Uint32Array,4)
JSTYPEDARRAY(CFloat,Float32,Float32Array,4)
JSTYPEDARRAY(CDouble,Float64,Float64Array,8)



-----------------------------------------------------------------------------
-- Misc
-----------------------------------------------------------------------------

seqList :: [a] -> [a]
seqList xs = go xs `seq` xs
  where go (x:ss) = x `seq` go ss
        go []     = ()
