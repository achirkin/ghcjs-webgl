{-# LANGUAGE FlexibleInstances, TypeSynonymInstances, FunctionalDependencies  #-}
{-# LANGUAGE TypeFamilies  #-}
{-# LANGUAGE CPP #-}
{-# LANGUAGE DataKinds, PolyKinds#-}
-----------------------------------------------------------------------------
-- |
-- Module      :  Data.TypedArray.ST
-- Copyright   :  (c) Artem Chirkin
-- License     :  BSD3
--
-- Maintainer  :  Artem Chirkin <chirkin@arch.ethz.ch>
-- Stability   :  experimental
-- Portability :
--
--
-----------------------------------------------------------------------------

module Data.TypedArray.ST where


-- import qualified GHC.Types as Exts
import GHC.ST

import Data.Word
import Data.Int
import Foreign.C.Types



import Unsafe.Coerce (unsafeCoerce)

import Data.TypedArray.Types
import Data.TypedArray.Internal

-----------------------------------------------------------------------------
-- | mutable typed arrays
-----------------------------------------------------------------------------

class STTypedArrayOperations a where
    -- | Init a new typed array filled with zeroes
    newSTTypedArray :: Int -> ST s (STTypedArray s a)
    -- | Fill a new typed array with a given value
    fillNewSTTypedArray :: Int -> a -> ST s (STTypedArray s a)
    -- | Create a new typed array from list
    newFromList :: [a] -> ST s (STTypedArray s a)
    -- | Create a new typed array from elements of another typed array
    newFromArray :: SomeTypedArray m0 a0 -> ST s (STTypedArray s a)
    -- | Set value into array at specified index
    setIndex ::Int -> a -> STTypedArray s a -> ST s ()
    -- | Set list into array with specified offset
    setList :: Int -> [a] -> STTypedArray s a -> ST s ()
    -- | Set list into array with specified offset
    setArray :: Int -> SomeTypedArray m0 a0 -> STTypedArray s a -> ST s ()


#define TYPEDARRAY(T,JSType,JSSize)\
instance STTypedArrayOperations T where{\
    {-# INLINE newSTTypedArray #-};\
    newSTTypedArray n = ST (js_createM/**/T/**/Array n);\
    {-# INLINE fillNewSTTypedArray #-};\
    fillNewSTTypedArray n v = ST (js_fillNewM/**/T/**/Array n v);\
    {-# INLINE newFromList #-};\
    newFromList xs = ST (js_fromListM/**/T/**/Array . unsafeCoerce . seqList $ xs);\
    {-# INLINE newFromArray #-};\
    newFromArray arr = ST (js_fromArrayM/**/T/**/Array arr);\
    {-# INLINE setIndex #-};\
    setIndex i v arr = ST (js_setIndex/**/T/**/Array i v arr);\
    {-# INLINE setList #-};\
    setList offset xs arr = ST (js_setList/**/T/**/Array offset (unsafeCoerce $ seqList xs) arr);\
    {-# INLINE setArray #-};\
    setArray offset ar0 arr = ST (js_setArray/**/T/**/Array offset ar0 arr)}


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


-----------------------------------------------------------------------------
-- | mutable anything
-----------------------------------------------------------------------------




class STArrayBufferData s mutable any | any s -> mutable where
    -- | Slice array (elements) or buffer (bytes).
    --   See documentation on TypedArray.prototype.slice() and ArrayBuffer.prototype.slice()
    slice :: Int -> Maybe Int -> any -> ST s mutable


class STArrayBufferConversions a where
    -- | Create an immutable data by copying a mutable data
    freeze :: a -> ST s (ImmutableVersion a)
    -- | Create an immutable data from a mutable data without
    --   copying. The result shares the buffer with the argument, do not modify
    --   the data in the original buffer after freezing
    unsafeFreeze :: a -> ST s (ImmutableVersion a)
    -- | Create a mutable data by copying an immutable data
    thaw :: ImmutableVersion a -> ST s a
    -- | Create a mutable data from an immutable data without
    --   copying. The result shares the buffer with the argument.
    unsafeThaw :: ImmutableVersion a -> ST s a


instance STArrayBufferData s (STArrayBuffer s) (SomeArrayBuffer m) where
    {-# INLINE slice #-}
    slice i0 Nothing (SomeArrayBuffer b) = fmap SomeArrayBuffer . ST $ js_slice1 i0 b
    slice i0 (Just i1) (SomeArrayBuffer b) = fmap SomeArrayBuffer . ST $ js_slice i0 i1 b

instance STArrayBufferConversions (STArrayBuffer s) where
    {-# INLINE freeze #-}
    freeze (SomeArrayBuffer b) = fmap SomeArrayBuffer (ST (js_slice1 0 b))
    {-# INLINE unsafeFreeze #-}
    unsafeFreeze (SomeArrayBuffer b) = pure (SomeArrayBuffer b)
    {-# INLINE thaw #-}
    thaw (SomeArrayBuffer b) = fmap SomeArrayBuffer (ST (js_slice1 0 b))
    {-# INLINE unsafeThaw #-}
    unsafeThaw (SomeArrayBuffer b) = pure (SomeArrayBuffer b)


instance STArrayBufferData s (STTypedArray s t) (SomeTypedArray m t) where
    {-# INLINE slice #-}
    slice i0 Nothing (SomeTypedArray b) = fmap SomeTypedArray . ST $ js_slice1 i0 b
    slice i0 (Just i1) (SomeTypedArray b) = fmap SomeTypedArray . ST $ js_slice i0 i1 b

instance STArrayBufferConversions (STTypedArray s t) where
    {-# INLINE freeze #-}
    freeze (SomeTypedArray b) = fmap SomeTypedArray (ST (js_slice1 0 b))
    {-# INLINE unsafeFreeze #-}
    unsafeFreeze (SomeTypedArray b) = pure (SomeTypedArray b)
    {-# INLINE thaw #-}
    thaw (SomeTypedArray b) = fmap SomeTypedArray (ST (js_slice1 0 b))
    {-# INLINE unsafeThaw #-}
    unsafeThaw (SomeTypedArray b) = pure (SomeTypedArray b)



-----------------------------------------------------------------------------
-- | Misc
-----------------------------------------------------------------------------

newSTArrayBuffer :: Int -> ST s (STArrayBuffer s)
newSTArrayBuffer size = ST (js_createArrayBuffer size)

