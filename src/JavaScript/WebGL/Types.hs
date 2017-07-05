{-# OPTIONS_GHC -fno-warn-unused-binds #-}
{-# LANGUAGE DataKinds, FlexibleInstances, MultiParamTypeClasses #-}
{-# LANGUAGE DefaultSignatures #-}
-----------------------------------------------------------------------------
-- |
-- Module      :  JsHs.WebGL.Types
-- Copyright   :  Copyright (C) 2015 Artem M. Chirkin <chirkin@arch.ethz.ch>
-- License     :  MIT
--
-- Maintainer  :  Artem M. Chirkin <chirkin@arch.ethz.ch>
-- Stability   :  Experimental
--
-- WebGL types
-- https://www.khronos.org/registry/webgl/specs/1.0.3/
--
-----------------------------------------------------------------------------

module JavaScript.WebGL.Types
    ( ArrayBufferView, IsArrayBufferView (..)
    , GLboolean, GLbyte, GLubyte, GLshort, GLushort, GLint, GLuint
    , GLfixed, GLint64, GLuint64, GLsizei, GLenum, GLintptr, GLsizeiptr
    , GLsync, GLbitfield, GLhalf, GLfloat, GLclampf, GLdouble, GLclampd
    , WebGLRenderingContext
    , WebGLProgram
    , WebGLShader
    , WebGLBuffer
    , WebGLFramebuffer
    , WebGLRenderbuffer
    , WebGLTexture, TexImageSource
    , WebGLUniformLocation
    , WebGLActiveInfo, aiSize, aiType, aiName
    , WebGLShaderPrecisionFormat, rangeMin, rangeMax, precision
) where


import Data.Word
import Foreign hiding (sizeOf)

import GHCJS.Types
import JavaScript.TypedArray
import JavaScript.TypedArray.DataView

import Unsafe.Coerce (unsafeCoerce)

newtype WebGLCanvas = WebGLCanvas JSVal
instance IsJSVal WebGLCanvas

-- | ArrayBufferView is a helper type representing any of the JavaScript TypedArray types
newtype ArrayBufferView = ArrayBufferView JSVal
instance IsJSVal ArrayBufferView

-- | Convert any TypedArray type into ArrayBufferView
class IsArrayBufferView a where
    asArrayBufferView :: a -> ArrayBufferView
    default asArrayBufferView :: IsJSVal a => a -> ArrayBufferView
    asArrayBufferView = ArrayBufferView . jsval
    {-# INLINE asArrayBufferView #-}

instance IsArrayBufferView Int8Array
instance IsArrayBufferView Uint8ClampedArray
instance IsArrayBufferView Int16Array
instance IsArrayBufferView Int32Array
instance IsArrayBufferView Uint8Array
instance IsArrayBufferView Uint16Array
instance IsArrayBufferView Float32Array
instance IsArrayBufferView Float64Array
instance IsArrayBufferView DataView where
  asArrayBufferView = unsafeCoerce
  {-# INLINE asArrayBufferView #-}
instance IsArrayBufferView MutableDataView where
  asArrayBufferView = unsafeCoerce
  {-# INLINE asArrayBufferView #-}


-- | 8bit boolean.
type GLboolean = Bool -- Word8

-- | 8bit signed two\'s complement binary integer.
type GLbyte = Int8 -- CSChar

-- | 8bit unsigned binary integer.
type GLubyte = Word8 -- CUChar

-- | 16bit signed two\'s complement binary integer.
type GLshort = Int16 -- CShort

-- | 16bit unsigned binary integer.
type GLushort = Word16 -- CUShort

-- | 32bit signed two\'s complement binary integer.
type GLint = Int32 -- CInt

-- | 32bit unsigned binary integer.
type GLuint = Word32 -- CUInt

-- | 32bit signed two\'s complement 16.16 scaled integer.
--   NOTE: OpenGL ES uses khronos_int32_t for this.
type GLfixed = Int32 -- CInt

-- | 64bit signed two\'s complement binary integer.
type GLint64 = Int64

-- | 64bit unsigned binary integer.
type GLuint64 = Word64

-- | 32bit non-negative binary integer size.
type GLsizei = Int32 -- Word32 -- CInt

-- | 32bit enumerated binary integer value.
type GLenum = Word32

-- | Pointer-sized signed two\'s complement binary integer.
--   NOTE: OpenGL ES uses khronos_intptr_t for this.
type GLintptr = Int32 --CPtrdiff

-- | Pointer-sized non-negative binary integer size.
--   NOTE: OpenGL ES uses khronos_ssize_t for this.
type GLsizeiptr = Word32 -- CPtrdiff

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


--   TODO : dictionary WebGLContextAttributes
-- | The WebGLRenderingContext represents the API allowing OpenGL ES 2.0 style rendering into the canvas element.
--   https://www.khronos.org/registry/webgl/specs/1.0.3/#5.14
newtype WebGLRenderingContext = WebGLRenderingContext JSVal
instance IsJSVal WebGLRenderingContext

-- | The WebGLBuffer interface represents an OpenGL Buffer Object.
--   The underlying object is created as if by calling glGenBuffers (OpenGL ES 2.0 §2.9, man page),
--   bound as if by calling glBindBuffer (OpenGL ES 2.0 §2.9, man page)
--   and destroyed as if by calling glDeleteBuffers (OpenGL ES 2.0 §2.9, man page).
--   https://www.khronos.org/registry/webgl/specs/1.0.3/#5.4
newtype WebGLBuffer = WebGLBuffer JSVal
instance IsJSVal WebGLBuffer

-- | The WebGLFramebuffer interface represents an OpenGL Framebuffer Object.
--   The underlying object is created as if by calling glGenFramebuffers (OpenGL ES 2.0 §4.4.1, man page),
--   bound as if by calling glBindFramebuffer (OpenGL ES 2.0 §4.4.1, man page)
--   and destroyed as if by calling glDeleteFramebuffers (OpenGL ES 2.0 §4.4.1, man page).
--   https://www.khronos.org/registry/webgl/specs/1.0.3/#5.5
newtype WebGLFramebuffer = WebGLFramebuffer JSVal
instance IsJSVal WebGLFramebuffer

-- | The WebGLProgram interface represents an OpenGL Program Object.
--   The underlying object is created as if by calling glCreateProgram (OpenGL ES 2.0 §2.10.3, man page),
--   used as if by calling glUseProgram (OpenGL ES 2.0 §2.10.3, man page)
--   and destroyed as if by calling glDeleteProgram (OpenGL ES 2.0 §2.10.3, man page).
--   https://www.khronos.org/registry/webgl/specs/1.0.3/#5.6
newtype WebGLProgram = WebGLProgram JSVal
instance IsJSVal WebGLProgram

-- | The WebGLRenderbuffer interface represents an OpenGL Renderbuffer Object.
--   The underlying object is created as if by calling glGenRenderbuffers (OpenGL ES 2.0 §4.4.3, man page),
--   bound as if by calling glBindRenderbuffer (OpenGL ES 2.0 §4.4.3, man page)
--   and destroyed as if by calling glDeleteRenderbuffers (OpenGL ES 2.0 §4.4.3, man page).
--   https://www.khronos.org/registry/webgl/specs/1.0.3/#5.7
newtype WebGLRenderbuffer = WebGLRenderbuffer JSVal
instance IsJSVal WebGLRenderbuffer

-- | The WebGLShader interface represents an OpenGL Shader Object.
--   The underlying object is created as if by calling glCreateShader (OpenGL ES 2.0 §2.10.1, man page),
--   attached to a Program as if by calling glAttachShader (OpenGL ES 2.0 §2.10.3, man page)
--   and destroyed as if by calling glDeleteShader (OpenGL ES 2.0 §2.10.1, man page).
--   https://www.khronos.org/registry/webgl/specs/1.0.3/#5.8
newtype WebGLShader = WebGLShader JSVal
instance IsJSVal WebGLShader

-- | The WebGLTexture interface represents an OpenGL Texture Object.
--   The underlying object is created as if by calling glGenTextures (OpenGL ES 2.0 §3.7.13, man page),
--   bound as if by calling glBindTexture (OpenGL ES 2.0 §3.7.13, man page)
--   and destroyed as if by calling glDeleteTextures (OpenGL ES 2.0 §3.7.13, man page).
--   https://www.khronos.org/registry/webgl/specs/1.0.3/#5.9
newtype WebGLTexture = WebGLTexture JSVal
instance IsJSVal WebGLTexture


-- | The WebGLUniformLocation interface represents the location of a uniform variable in a shader program.
--   https://www.khronos.org/registry/webgl/specs/1.0.3/#5.10
newtype WebGLUniformLocation = WebGLUniformLocation JSVal
instance IsJSVal WebGLUniformLocation


-- | The WebGLActiveInfo interface represents the information returned from the getActiveAttrib and getActiveUniform calls.
--   https://www.khronos.org/registry/webgl/specs/1.0.3/#5.11
newtype WebGLActiveInfo = WebGLActiveInfo JSVal
instance IsJSVal WebGLActiveInfo
-- | readonly attribute GLint size: The size of the requested variable.
foreign import javascript unsafe "$r = $1.size"
    aiSize :: WebGLActiveInfo -> GLint
-- | readonly attribute GLenum type: The data type of the requested variable.
foreign import javascript unsafe "$r = $1.type"
    aiType :: WebGLActiveInfo -> GLenum
-- | readonly attribute DOMString name: The name of the requested variable.
foreign import javascript unsafe "$r = $1.name"
    aiName :: WebGLActiveInfo -> JSString

-- | The WebGLShaderPrecisionFormat interface represents the information returned from the getShaderPrecisionFormat call.
--   https://www.khronos.org/registry/webgl/specs/1.0.3/#5.12
newtype WebGLShaderPrecisionFormat = WebGLShaderPrecisionFormat JSVal
instance IsJSVal WebGLShaderPrecisionFormat
-- | readonly attribute GLint rangeMin: The base 2 log of the absolute value of the minimum value that can be represented.
foreign import javascript unsafe "$r = $1.rangeMin"
    rangeMin :: WebGLShaderPrecisionFormat -> GLint
-- | readonly attribute GLint rangeMax: The base 2 log of the absolute value of the maximum value that can be represented.
foreign import javascript unsafe "$r = $1.rangeMax"
    rangeMax :: WebGLShaderPrecisionFormat -> GLint
-- | readonly attribute GLint precision: The number of bits of precision that can be represented. For integer formats this value is always 0.
foreign import javascript unsafe "$r = $1.precision"
    precision :: WebGLShaderPrecisionFormat -> GLint


-- | typedef (ImageData or HTMLImageElement or HTMLCanvasElement or HTMLVideoElement) TexImageSource;
--   https://www.khronos.org/registry/webgl/specs/1.0.3/#6.7
newtype TexImageSource = TexImageSource JSVal
instance IsJSVal TexImageSource
