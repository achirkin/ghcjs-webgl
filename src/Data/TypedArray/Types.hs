{-# LANGUAGE DeriveDataTypeable,GeneralizedNewtypeDeriving, TypeFamilies, CPP #-}
{-# LANGUAGE DataKinds, PolyKinds #-}
-----------------------------------------------------------------------------
-- |
-- Module      :  Data.TypedArray.Types
-- Copyright   :  (c) Artem Chirkin
-- License     :  BSD3
--
-- Maintainer  :  Artem Chirkin <chirkin@arch.ethz.ch>
-- Stability   :  experimental
-- Portability :
--
--
-----------------------------------------------------------------------------

module Data.TypedArray.Types where


import Data.Typeable (Typeable)
import Data.Word (Word8)
import Data.Ix (Ix)
import Data.Data (Data)
import Data.Bits (Bits, FiniteBits)
import Foreign.Storable (Storable)

import GHCJS.Marshal.Pure
import GHCJS.Types

-- | Stub for Uint8ClampedArray in JS
newtype Word8Clamped = Clamped Word8 deriving
    (Ord,Num,Eq,Bounded,Enum,Integral,Data,Real,Show,Ix,FiniteBits,Bits,Storable)


type TypedArray a = SomeTypedArray 'Immutable a
type STTypedArray s a = SomeTypedArray ('STMutable s) a
type IOTypedArray a = SomeTypedArray 'Mutable a

-- | Any typed array, mutable or immutable
newtype SomeTypedArray (m :: MutabilityType s) a = SomeTypedArray JSVal deriving Typeable
instance IsJSVal (SomeTypedArray m a)

instance PToJSVal (SomeTypedArray m a) where
  pToJSVal (SomeTypedArray v) = v
instance PFromJSVal (SomeTypedArray m a) where
  pFromJSVal = SomeTypedArray

-- | ArrayBuffer, mutable or immutable
newtype SomeArrayBuffer (a :: MutabilityType s) = SomeArrayBuffer JSVal deriving Typeable
instance IsJSVal (SomeArrayBuffer m)

type ArrayBuffer      = SomeArrayBuffer 'Immutable
type IOArrayBuffer    = SomeArrayBuffer 'Mutable
type STArrayBuffer s  = SomeArrayBuffer ('STMutable s)

instance PToJSVal (SomeArrayBuffer m) where
    pToJSVal (SomeArrayBuffer b) = b
instance PFromJSVal (SomeArrayBuffer m) where
    pFromJSVal = SomeArrayBuffer



type family ImmutableVersion a where
    ImmutableVersion (SomeArrayBuffer m) = ArrayBuffer
    ImmutableVersion (SomeTypedArray m t) = TypedArray t


-- following should come from GHCJS.Internal.Types

data MutabilityType s = Mutable
                      | Immutable
                      | STMutable s

data IsItMutable = IsImmutable
                 | IsMutable

type family Mutability (a :: MutabilityType s) :: IsItMutable where
    Mutability 'Immutable     = 'IsImmutable
    Mutability 'Mutable       = 'IsMutable
    Mutability ('STMutable s) = 'IsMutable
