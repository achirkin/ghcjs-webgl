{-# LANGUAGE TypeFamilies #-}
{-# LANGUAGE FlexibleInstances, MultiParamTypeClasses, TypeSynonymInstances #-}

-----------------------------------------------------------------------------
-- |
-- Module      :  GHCJS.WebGL.Types
-- Copyright   :  Copyright (C) 2015 Artem M. Chirkin <chirkin@arch.ethz.ch>
-- License     :  BSD3
--
-- Maintainer  :  Artem M. Chirkin <chirkin@arch.ethz.ch>
-- Stability   :  Experimental
--
-- WebGL types
-- https://www.khronos.org/registry/webgl/specs/1.0/
--
-----------------------------------------------------------------------------

module GHCJS.WebGL.Types
    ( GLboolean, GLbyte, GLubyte, GLshort, GLushort, GLint, GLuint
    , GLfixed, GLint64, GLuint64, GLsizei, GLenum, GLintptr, GLsizeiptr
    , GLsync, GLbitfield, GLhalf, GLfloat, GLclampf, GLdouble, GLclampd
    , Ctx, getCtx
    , Program
    , Shader
    , Buffer
    , FrameBuffer
    , RenderBuffer
    , Texture, TexImageSource
    , UniformLocation
    , ActiveInfo, aiSize, aiType, aiName
    , ShaderPrecisionFormat
    , ArrayBuffer, mallocArrayBuffer, newArrayBuffer
    , TypedArrayValue (typedArrayView, newTypedArray, setIdx, getIdx)
    , TypedArray, fillTypedArray, getBuffer
) where

import qualified Data.Foldable as FL

import Data.Primitive.ByteArray (MutableByteArray, newByteArray, writeByteArray)
import Data.Primitive.Types (Prim)
import Data.Primitive (sizeOf)
import Control.Monad.Primitive (PrimState)

import GHCJS.Types
import GHCJS.Foreign (wrapMutableBuffer)
import Data.Word
import Foreign hiding (sizeOf)
import qualified Control.Monad as M
import Unsafe.Coerce

-- | 8bit boolean.
type GLboolean = Bool -- Word8

-- | 8bit signed two\'s complement binary integer.
type GLbyte = Int8 -- CSChar

-- | 8bit unsigned binary integer.
type GLubyte = Word8 -- CUChar

-- | 8bit characters making up strings.
--type GLchar = CChar

-- | 16bit signed two\'s complement binary integer.
type GLshort = Int16 -- CShort

-- | 16bit unsigned binary integer.
type GLushort = Word16 -- CUShort

-- | 32bit signed two\'s complement binary integer.
type GLint = Int32 -- CInt

-- | 32bit unsigned binary integer.
type GLuint = Word32 -- CUInt

-- | 32bit signed two\'s complement 16.16 scaled integer.
type GLfixed = Int32 -- CInt
-- NOTE: OpenGL ES uses khronos_int32_t for this.

-- | 64bit signed two\'s complement binary integer.
type GLint64 = Int64

-- | 64bit unsigned binary integer.
type GLuint64 = Word64

-- | 32bit non-negative binary integer size.
type GLsizei = Int32 -- Word32 -- CInt

-- | 32bit enumerated binary integer value.
type GLenum = Word32

-- | Pointer-sized signed two\'s complement binary integer.
type GLintptr = Int32 --CPtrdiff
-- NOTE: OpenGL ES uses khronos_intptr_t for this.

-- | Pointer-sized non-negative binary integer size.
type GLsizeiptr = Word32 -- CPtrdiff
-- NOTE: OpenGL ES uses khronos_ssize_t for this.

-- | Pointer-sized sync object handle.
type GLsync = Ptr ()

-- | 32bit bit field.
type GLbitfield = Word32 -- CUInt

-- | 16bit half-precision floating-point value encoded in an unsigned scalar.
type GLhalf = Word16 --CUShort

-- | 32bit floating-point value.
type GLfloat = Float

-- | 32bit floating-point value clamped to [0, 1].
type GLclampf = Float

-- | 64bit floating-point value.
type GLdouble = Double

-- | 64bit floating-point value clamped to [0, 1].
type GLclampd = Double

data Ctx_
-- | WebGL Context
type Ctx = JSRef Ctx_

-- | ArrayBuffer in JS
type ArrayBuffer = MutableByteArray (PrimState IO)

data Program_
type Program = JSRef Program_

data Shader_
type Shader = JSRef Shader_

data Buffer_
type Buffer = JSRef Buffer_

data FrameBuffer_
type FrameBuffer = JSRef FrameBuffer_

data RenderBuffer_
type RenderBuffer = JSRef RenderBuffer_

data Texture_
type Texture = JSRef Texture_

data TexImageSource_
type TexImageSource = JSRef TexImageSource_

data UniformLocation_
type UniformLocation = JSRef UniformLocation_

data ActiveInfo_
-- |interface WebGLActiveInfo {
--    readonly attribute GLint size;
--    readonly attribute GLenum type;
--    readonly attribute DOMString name;
-- };
type ActiveInfo = JSRef ActiveInfo_
foreign import javascript unsafe "$r = $1.size"
    aiSize :: ActiveInfo -> IO GLint
foreign import javascript unsafe "$r = $1.type"
    aiType :: ActiveInfo -> IO GLenum
foreign import javascript unsafe "$r = $1.name"
    aiName :: ActiveInfo -> IO JSString


data ShaderPrecisionFormat_
type ShaderPrecisionFormat = JSRef ShaderPrecisionFormat_


-- | Operations on JS typed arrays
class TypedArrayValue a where
    -- | JS TypedArray
    data TypedArray_ a
    -- | TypedArray view of an ArrayBuffer
    typedArrayView :: ArrayBuffer -> IO (TypedArray a)
    -- | new TypedArray given the number of elements
    newTypedArray :: Int -> IO (TypedArray a)
    -- | set value at index
    setIdx :: TypedArray a -> Int -> a -> IO ()
    -- | get value at index
    getIdx :: TypedArray a -> Int -> IO a

-- | JS TypedArray
type TypedArray a = JSRef (TypedArray_ a)

instance TypedArrayValue GLbyte where
    data TypedArray_ GLbyte
    typedArrayView = int8ArrayB_ . unsafeCoerce
    newTypedArray = int8Array_
    setIdx = setIdxInt8
    getIdx = getIdxInt8

instance TypedArrayValue GLubyte where
    data TypedArray_ GLubyte
    typedArrayView = uint8ArrayB_ . unsafeCoerce
    newTypedArray = uint8Array_
    setIdx = setIdxUint8
    getIdx = getIdxUint8

instance TypedArrayValue GLshort where
    data TypedArray_ GLshort
    typedArrayView = int16ArrayB_ . unsafeCoerce
    newTypedArray = int16Array_
    setIdx = setIdxInt16
    getIdx = getIdxInt16

instance TypedArrayValue GLushort where
    data TypedArray_ GLushort
    typedArrayView = uint16ArrayB_ . unsafeCoerce
    newTypedArray = uint16Array_
    setIdx = setIdxUint16
    getIdx  = getIdxUint16

instance TypedArrayValue GLint where
    data TypedArray_ GLint
    typedArrayView = int32ArrayB_ . unsafeCoerce
    newTypedArray = int32Array_
    setIdx = setIdxInt32
    getIdx = getIdxInt32

instance TypedArrayValue GLuint where
    data TypedArray_ GLuint
    typedArrayView = uint32ArrayB_ . unsafeCoerce
    newTypedArray = uint32Array_
    setIdx = setIdxUint32
    getIdx = getIdxUint32

instance TypedArrayValue GLfloat where
    data TypedArray_ GLfloat
    typedArrayView = float32ArrayB_ . unsafeCoerce
    newTypedArray = float32Array_
    setIdx = setIdxFloat32
    getIdx = getIdxFloat32

instance TypedArrayValue GLdouble where
    data TypedArray_ GLdouble
    typedArrayView = float64ArrayB_ . unsafeCoerce
    newTypedArray = float64Array_
    setIdx = setIdxFloat64
    getIdx = getIdxFloat64

-- | Put values from Foldable to TypedArray.
--   Array size is not checked and must be consistent
fillTypedArray :: (FL.Foldable t, TypedArrayValue a) => TypedArray a -> t a -> IO ()
fillTypedArray arr xs = M.void (FL.foldlM f (arr,0) xs) -- >> (logthis . unsafeCoerce $ arr)
    where f (ptr,i) value = setIdx ptr i value >> return (ptr,i+1)


foreign import javascript unsafe "$r = new Int8Array($1)"
    int8Array_ :: Int -> IO (TypedArray GLbyte)
foreign import javascript unsafe "$r = new Uint8Array($1)"
    uint8Array_ :: Int -> IO (TypedArray GLubyte)
foreign import javascript unsafe "$r = new Int16Array($1)"
    int16Array_ :: Int -> IO (TypedArray GLshort)
foreign import javascript unsafe "$r = new Uint16Array($1)"
    uint16Array_ :: Int -> IO (TypedArray GLushort)
foreign import javascript unsafe "$r = new Int32Array($1)"
    int32Array_ :: Int -> IO (TypedArray GLint)
foreign import javascript unsafe "$r = new Uint32Array($1)"
    uint32Array_ :: Int -> IO (TypedArray GLuint)
foreign import javascript unsafe "$r = new Float32Array($1)"
    float32Array_ :: Int -> IO (TypedArray GLfloat)
foreign import javascript unsafe "$r = new Float64Array($1)"
    float64Array_ :: Int -> IO (TypedArray GLdouble)

foreign import javascript unsafe "$r = new Int8Array($1.buf)"
    int8ArrayB_ :: JSRef a -> IO (TypedArray GLbyte)
foreign import javascript unsafe "$r = new Uint8Array($1.buf)"
    uint8ArrayB_ :: JSRef a -> IO (TypedArray GLubyte)
foreign import javascript unsafe "$r = new Int16Array($1.buf)"
    int16ArrayB_ :: JSRef a -> IO (TypedArray GLshort)
foreign import javascript unsafe "$r = new Uint16Array($1.buf)"
    uint16ArrayB_ :: JSRef a -> IO (TypedArray GLushort)
foreign import javascript unsafe "$r = new Int32Array($1.buf)"
    int32ArrayB_ :: JSRef a -> IO (TypedArray GLint)
foreign import javascript unsafe "$r = new Uint32Array($1.buf)"
    uint32ArrayB_ :: JSRef a -> IO (TypedArray GLuint)
foreign import javascript unsafe "$r = new Float32Array($1.buf)"
    float32ArrayB_ :: JSRef a -> IO (TypedArray GLfloat)
foreign import javascript unsafe "$r = new Float64Array($1.buf)"
    float64ArrayB_ :: JSRef a -> IO (TypedArray GLdouble)

foreign import javascript unsafe "$1[$2] = $3"
    setIdxInt8 :: TypedArray GLbyte -> Int -> GLbyte -> IO ()
foreign import javascript unsafe "$1[$2] = $3"
    setIdxUint8 :: TypedArray GLubyte -> Int -> GLubyte -> IO ()
foreign import javascript unsafe "$1[$2] = $3"
    setIdxInt16 :: TypedArray GLshort -> Int -> GLshort -> IO ()
foreign import javascript unsafe "$1[$2] = $3"
    setIdxUint16 :: TypedArray GLushort -> Int -> GLushort -> IO ()
foreign import javascript unsafe "$1[$2] = $3"
    setIdxInt32 :: TypedArray GLint -> Int -> GLint -> IO ()
foreign import javascript unsafe "$1[$2] = $3"
    setIdxUint32 ::TypedArray GLuint -> Int -> GLuint -> IO ()
foreign import javascript unsafe "$1[$2] = $3"
    setIdxFloat32 :: TypedArray GLfloat -> Int -> GLfloat -> IO ()
foreign import javascript unsafe "$1[$2] = $3"
    setIdxFloat64 :: TypedArray GLdouble -> Int -> GLdouble -> IO ()

foreign import javascript unsafe "$r = $1[$2]"
    getIdxInt8 :: TypedArray GLbyte -> Int -> IO GLbyte
foreign import javascript unsafe "$r = $1[$2]"
    getIdxUint8 :: TypedArray GLubyte -> Int -> IO GLubyte
foreign import javascript unsafe "$r = $1[$2]"
    getIdxInt16 :: TypedArray GLshort -> Int -> IO GLshort
foreign import javascript unsafe "$r = $1[$2]"
    getIdxUint16 :: TypedArray GLushort -> Int -> IO GLushort
foreign import javascript unsafe "$r = $1[$2]"
    getIdxInt32 :: TypedArray GLint -> Int -> IO GLint
foreign import javascript unsafe "$r = $1[$2]"
    getIdxUint32 ::TypedArray GLuint -> Int -> IO GLuint
foreign import javascript unsafe "$r = $1[$2]"
    getIdxFloat32 :: TypedArray GLfloat -> Int -> IO GLfloat
foreign import javascript unsafe "$r = $1[$2]"
    getIdxFloat64 :: TypedArray GLdouble -> Int -> IO GLdouble


--foreign import javascript unsafe "console.log($1)"
--    logthis :: JSRef a -> IO ()

-- | Get Javascript WebGL Context from html canvas element
foreign import javascript unsafe "$r = ($1.getContext(\"webgl\")) ? $1.getContext(\"webgl\") : $1.getContext(\"experimental-webgl\")"
    getCtx :: JSRef a -> IO Ctx

foreign import javascript unsafe "$r = $1.buffer"
    getBuffer' :: TypedArray a -> IO (JSRef a)

-- | Get underlying ArrayBuffer from Typed Array
getBuffer :: TypedArray a -> IO ArrayBuffer
getBuffer arr = getBuffer' arr >>= wrapMutableBuffer 0 0


-- | Copy list into newly created ArrayBuffer
newArrayBuffer :: (Prim a) => [a] -> IO ArrayBuffer
newArrayBuffer xs = do
    buf <- newByteArray (n*m)
    mapM_ (\(v,i) -> writeByteArray buf i v) (zip xs [0..])
    return buf
    where n = length xs
          m = sizeOf . head $ xs

-- | Allocate memory in bytes for ArrayBuffer
mallocArrayBuffer :: Int -> IO ArrayBuffer
mallocArrayBuffer = newByteArray
