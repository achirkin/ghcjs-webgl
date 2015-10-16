{-# LANGUAGE CPP #-}
{-# LANGUAGE PolyKinds #-}
{-# OPTIONS_GHC -fno-warn-orphans #-}
-----------------------------------------------------------------------------
-- |
-- Module      :  Data.TypedArray
-- Copyright   :  (c) Artem Chirkin
-- License     :  BSD3
--
-- Maintainer  :  Artem Chirkin <chirkin@arch.ethz.ch>
-- Stability   :  experimental
-- Portability :
--
--
-----------------------------------------------------------------------------

module Data.TypedArray
    ( module Data.TypedArray.Types
    , ArrayBufferData (..)
    , TypedArrayOperations (..)
    , arrayLength, arrayBuffer
    ) where

import Data.Word
import Data.Int
import Data.Coerce
import Foreign.C.Types
import Unsafe.Coerce (unsafeCoerce)


import Data.TypedArray.Internal
import Data.TypedArray.Types

-----------------------------------------------------------------------------
-- | Helper instances
-----------------------------------------------------------------------------

instance Show (SomeTypedArray m t) where
    show = show . js_show

-----------------------------------------------------------------------------
-- | Common functions on buffers and views
-----------------------------------------------------------------------------

class ArrayBufferData a where
    -- | Length of buffer or its view in bytes
    byteLength :: a -> Int
    -- | Slice array (elements) or buffer (bytes).
    --   See documentation on TypedArray.prototype.slice() and ArrayBuffer.prototype.slice()
    sliceImmutable :: Int -> Maybe Int -> a -> a

instance ArrayBufferData (SomeArrayBuffer m) where
    {-# INLINE byteLength #-}
    byteLength = js_byteLength . coerce
    {-# INLINE sliceImmutable #-}
    sliceImmutable i0 Nothing arr = coerce $ js_slice1_imm i0 (coerce arr)
    sliceImmutable i0 (Just i1) arr = coerce $ js_slice_imm i0 i1 (coerce arr)

instance ArrayBufferData (SomeTypedArray m t) where
    {-# INLINE byteLength #-}
    byteLength = js_byteLength . coerce
    {-# INLINE sliceImmutable #-}
    sliceImmutable i0 Nothing arr = coerce $ js_slice1_imm i0 (coerce arr)
    sliceImmutable i0 (Just i1) arr = coerce $ js_slice_imm i0 i1 (coerce arr)




-----------------------------------------------------------------------------
-- | Typed array immutable functions
-----------------------------------------------------------------------------

class TypedArrayOperations a where
    -- | Init a new typed array filled with zeroes
    typedArray :: Int -> SomeTypedArray m a
    -- | Fill a new typed array with a given value
    fillNewTypedArray :: Int -> a -> SomeTypedArray m a
    -- | Create a new typed array from list
    fromList :: [a] -> SomeTypedArray m a
    -- | Create a new typed array from elements of another typed array
    fromArray :: SomeTypedArray m0 a0 -> SomeTypedArray m a
    -- | Create a typed array view on a given array buffer (do not copy data)
    arrayView :: SomeArrayBuffer m -> SomeTypedArray m a
    -- | Index typed array
    (!) :: SomeTypedArray m a -> Int -> a
    -- | Size of an array element, in bytes
    elemSize :: SomeTypedArray m a -> Int
    -- | First occurence of a given element in the array, starting from specified index
    indexOf :: Int -> a -> SomeTypedArray m a -> Int
    -- | Last occurence of a given element in the array, search backwards starting from specified index
    lastIndexOf :: Int -> a -> SomeTypedArray m a -> Int


#define TYPEDARRAY(T,JSType,JSSize)\
instance TypedArrayOperations T where{\
    {-# INLINE typedArray #-};\
    typedArray = js_create/**/T/**/Array;\
    {-# INLINE fillNewTypedArray #-};\
    fillNewTypedArray = js_fillNew/**/T/**/Array;\
    {-# INLINE fromList #-};\
    fromList = js_fromList/**/T/**/Array . unsafeCoerce . seqList;\
    {-# INLINE fromArray #-};\
    fromArray = js_fromArray/**/T/**/Array;\
    {-# INLINE arrayView #-};\
    arrayView = js_view/**/T/**/Array;\
    {-# INLINE (!) #-};\
    (!) = js_index/**/T/**/Array;\
    {-# INLINE elemSize #-};\
    elemSize _ = JSSize;\
    {-# INLINE indexOf #-};\
    indexOf = js_indexOf/**/T/**/Array;\
    {-# INLINE lastIndexOf #-};\
    lastIndexOf = js_lastIndexOf/**/T/**/Array}


TYPEDARRAY(Int,Int32,4)
TYPEDARRAY(Int32,Int32,4)
TYPEDARRAY(Int16,Int16,2)
TYPEDARRAY(Int8,Int8,1)
TYPEDARRAY(Word,Uint32,4)
TYPEDARRAY(Word32,Uint32,4)
TYPEDARRAY(Word16,Uint16,2)
TYPEDARRAY(Word8,Uint8,1)
TYPEDARRAY(Word8Clamped,Uint8Clamped,1)
TYPEDARRAY(Float,Float32,4)
TYPEDARRAY(Double,Float64,8)
TYPEDARRAY(CChar,Int8,1)
TYPEDARRAY(CSChar,Int8,1)
TYPEDARRAY(CUChar,Uint8,1)
TYPEDARRAY(CShort,Int16,2)
TYPEDARRAY(CUShort,Uint16,2)
TYPEDARRAY(CInt,Int32,4)
TYPEDARRAY(CUInt,Uint32,4)
TYPEDARRAY(CLong,Int32,4)
TYPEDARRAY(CULong,Uint32,4)
TYPEDARRAY(CFloat,Float32,4)
TYPEDARRAY(CDouble,Float64,8)

