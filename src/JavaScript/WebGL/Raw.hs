{-# LANGUAGE PolyKinds #-}
{-# LANGUAGE JavaScriptFFI #-}
{-# LANGUAGE DataKinds, KindSignatures #-}
-----------------------------------------------------------------------------
-- |
-- Module      :  JsHs.WebGL.Raw
-- Copyright   :  Copyright (C) 2015 Artem M. Chirkin <chirkin@arch.ethz.ch>
-- License     :  MIT
--
-- Maintainer  :  Artem M. Chirkin <chirkin@arch.ethz.ch>
-- Stability   :  Experimental
--
-- Functions in WebGL 1.0.3 spec.
-- https://www.khronos.org/registry/webgl/specs/1.0.3/
--
-----------------------------------------------------------------------------

module JavaScript.WebGL.Raw where


import GHCJS.Types (JSString, JSVal, nullRef)
import JavaScript.TypedArray.ArrayBuffer
import JavaScript.Web.Canvas (Canvas)
import Unsafe.Coerce

import Numeric.Dimensions
import Numeric.DataFrame
import Numeric.DataFrame.IO (IODataFrame)

import JavaScript.WebGL.Types

foreign import javascript unsafe "$1.activeTexture($2)"
    activeTexture :: WebGLRenderingContext -> GLenum -> IO ()

foreign import javascript unsafe "$1.attachShader($2, $3)"
    attachShader :: WebGLRenderingContext -> WebGLProgram -> WebGLShader -> IO ()

foreign import javascript unsafe "$1.bindAttribLocation($2, $3, $4)"
    bindAttribLocation :: WebGLRenderingContext -> WebGLProgram -> GLuint -> JSString -> IO ()


bindBuffer :: WebGLRenderingContext -> GLenum -> Maybe WebGLBuffer -> IO ()
bindBuffer a b Nothing = js_bindBuffer a b (unsafeCoerce nullRef)
bindBuffer a b (Just v) = js_bindBuffer a b v

foreign import javascript unsafe "$1.bindBuffer($2, $3)"
    js_bindBuffer :: WebGLRenderingContext -> GLenum -> WebGLBuffer -> IO ()

bindFramebuffer :: WebGLRenderingContext -> GLenum -> Maybe WebGLFramebuffer -> IO ()
bindFramebuffer a b Nothing = js_bindFramebuffer a b (unsafeCoerce nullRef)
bindFramebuffer a b (Just v) = js_bindFramebuffer a b v

foreign import javascript unsafe "$1.bindFramebuffer($2, $3)"
    js_bindFramebuffer :: WebGLRenderingContext -> GLenum -> WebGLFramebuffer -> IO ()

bindRenderbuffer :: WebGLRenderingContext -> GLenum -> Maybe WebGLRenderbuffer -> IO ()
bindRenderbuffer a b Nothing = js_bindRenderbuffer a b (unsafeCoerce nullRef)
bindRenderbuffer a b (Just v) = js_bindRenderbuffer a b v

foreign import javascript unsafe "$1.bindRenderbuffer($2, $3)"
    js_bindRenderbuffer :: WebGLRenderingContext -> GLenum -> WebGLRenderbuffer -> IO ()

bindTexture :: WebGLRenderingContext -> GLenum -> Maybe WebGLTexture -> IO ()
bindTexture a b Nothing = js_bindTexture a b (unsafeCoerce nullRef)
bindTexture a b (Just v) = js_bindTexture a b v

foreign import javascript unsafe "$1.bindTexture($2, $3)"
    js_bindTexture :: WebGLRenderingContext -> GLenum -> WebGLTexture -> IO ()

foreign import javascript unsafe "$1.blendColor($2, $3, $4, $5)"
    blendColor :: WebGLRenderingContext -> GLclampf -> GLclampf -> GLclampf -> GLclampf -> IO ()

foreign import javascript unsafe "$1.blendEquation($2)"
    blendEquation :: WebGLRenderingContext -> GLenum -> IO ()

foreign import javascript unsafe "$1.blendEquationSeparate($2, $3)"
    blendEquationSeparate :: WebGLRenderingContext -> GLenum -> GLenum -> IO ()

foreign import javascript unsafe "$1.blendFunc($2, $3)"
    blendFunc :: WebGLRenderingContext -> GLenum -> GLenum -> IO ()

foreign import javascript unsafe "$1.blendFuncSeparate($2, $3, $4, $5)"
    blendFuncSeparate :: WebGLRenderingContext -> GLenum -> GLenum -> GLenum -> GLenum -> IO ()

--void bufferData(GLenum target, GLsizeiptr size, GLenum usage) (OpenGL ES 2.0 §2.9, man page)
--Set the size of the currently bound WebGLBuffer object for the passed target. The buffer is initialized to 0.

-- | void bufferData(GLenum target, BufferDataSource? data, GLenum usage) (OpenGL ES 2.0 §2.9, man page)
--   Set the size of the currently bound WebGLBuffer object for the passed target to the size of the passed data,
--   then write the contents of data to the buffer object.
foreign import javascript unsafe "$1.bufferData($2, $3, $4)"
    bufferData :: WebGLRenderingContext -> GLenum -> MutableArrayBuffer -> GLenum -> IO ()

-- | void bufferSubData(GLenum target, GLintptr offset, BufferDataSource? data) (OpenGL ES 2.0 §2.9, man page)
--   For the WebGLBuffer object bound to the passed target write the passed data starting at the passed offset.
--   If the data would be written past the end of the buffer object an INVALID_VALUE error is generated.
--   If data is null then an INVALID_VALUE error is generated.
foreign import javascript unsafe "$1.bufferSubData($2, $3, $4)"
    bufferSubData :: WebGLRenderingContext -> GLenum -> GLintptr -> MutableArrayBuffer -> IO ()


foreign import javascript unsafe "$1.checkFramebufferStatus($2)"
    checkFramebufferStatus :: WebGLRenderingContext -> GLenum -> IO GLenum

foreign import javascript unsafe "$1.clear($2)"
    clear :: WebGLRenderingContext -> GLbitfield -> IO ()

foreign import javascript unsafe "$1.clearColor($2, $3, $4, $5)"
    clearColor :: WebGLRenderingContext -> GLclampf -> GLclampf -> GLclampf -> GLclampf -> IO ()

foreign import javascript unsafe "$1.clearDepth($2)"
    clearDepth :: WebGLRenderingContext -> GLclampf -> IO ()

foreign import javascript unsafe "$1.clearStencil($2)"
    clearStencil :: WebGLRenderingContext -> GLint-> IO ()

-- | void colorMask(GLboolean red, GLboolean green, GLboolean blue, GLboolean alpha) (OpenGL ES 2.0 §4.2.2, man page)
foreign import javascript unsafe "$1.colorMask($2, $3, $4, $5)"
    colorMask :: WebGLRenderingContext -> GLboolean -> GLboolean -> GLboolean -> GLboolean -> IO ()

foreign import javascript unsafe "$1.compileShader($2)"
    compileShader :: WebGLRenderingContext -> WebGLShader -> IO ()

foreign import javascript unsafe "$1.compressedTexImage2D($2, $3, $4, $5, $6, $7, $8)"
    js_compressedTexImage2D :: WebGLRenderingContext -> GLenum -> GLint-> GLenum -> GLsizei-> GLsizei-> GLint-> JSVal -> IO ()
compressedTexImage2D :: WebGLRenderingContext -> GLenum -> GLint-> GLenum -> GLsizei-> GLsizei-> GLint-> DataFrame t (ds::[Nat]) -> IO ()
compressedTexImage2D a b c d e f g = js_compressedTexImage2D a b c d e f g . unsafeCoerce

foreign import javascript unsafe "$1.compressedTexSubImage2D($2, $3, $4, $5, $6, $7, $8, $9)"
    js_compressedTexSubImage2D :: WebGLRenderingContext -> GLenum -> GLint-> GLint-> GLint-> GLsizei-> GLsizei-> GLenum -> JSVal -> IO ()
compressedTexSubImage2D :: WebGLRenderingContext -> GLenum -> GLint-> GLint-> GLint-> GLsizei-> GLsizei-> GLenum -> DataFrame t (ds::[Nat]) -> IO ()
compressedTexSubImage2D a b c d e f g h = js_compressedTexSubImage2D a b c d e f g h . unsafeCoerce

foreign import javascript unsafe "$1.copyTexImage2D($2, $3, $4, $5, $6, $7, $8, $9)"
    copyTexImage2D :: WebGLRenderingContext -> GLenum -> GLint -> GLenum -> GLint -> GLint -> GLsizei -> GLsizei-> GLint-> IO ()

foreign import javascript unsafe "$1.copyTexSubImage2D($2, $3, $4, $5, $6, $7, $8, $9)"
    copyTexSubImage2D :: WebGLRenderingContext -> GLenum -> GLint-> GLint-> GLint-> GLint-> GLint-> GLsizei-> GLsizei-> IO ()

foreign import javascript unsafe "$1.createBuffer()"
    createBuffer :: WebGLRenderingContext -> IO WebGLBuffer

foreign import javascript unsafe "$1.createFramebuffer()"
    createFramebuffer :: WebGLRenderingContext -> IO WebGLFramebuffer

foreign import javascript unsafe "$1.createProgram()"
    createProgram :: WebGLRenderingContext -> IO WebGLProgram

foreign import javascript unsafe "$1.createRenderbuffer()"
    createRenderbuffer :: WebGLRenderingContext -> IO WebGLRenderbuffer

foreign import javascript unsafe "$1.createShader($2)"
    createShader :: WebGLRenderingContext -> GLenum -> IO WebGLShader

foreign import javascript unsafe "$1.createTexture()"
    createTexture :: WebGLRenderingContext -> IO WebGLTexture

foreign import javascript unsafe "$1.cullFace($2)"
    cullFace :: WebGLRenderingContext -> GLenum -> IO ()

foreign import javascript unsafe "$1.deleteBuffer($2)"
    deleteBuffer :: WebGLRenderingContext -> WebGLBuffer -> IO ()

foreign import javascript unsafe "$1.deleteFramebuffer($2)"
    deleteFramebuffer :: WebGLRenderingContext -> WebGLFramebuffer -> IO ()

foreign import javascript unsafe "$1.deleteProgram($2)"
    deleteProgram :: WebGLRenderingContext -> WebGLProgram -> IO ()

foreign import javascript unsafe "$1.deleteRenderbuffer($2)"
    deleteRenderbuffer :: WebGLRenderingContext -> WebGLRenderbuffer -> IO ()

foreign import javascript unsafe "$1.deleteShader($2)"
    deleteShader :: WebGLRenderingContext -> WebGLShader -> IO ()

foreign import javascript unsafe "$1.deleteTexture($2)"
    deleteTexture :: WebGLRenderingContext -> WebGLTexture -> IO ()

foreign import javascript unsafe "$1.depthFunc($2)"
    depthFunc :: WebGLRenderingContext -> GLenum -> IO ()

foreign import javascript unsafe "$1.depthMask($2)"
    depthMask :: WebGLRenderingContext -> GLboolean -> IO ()

foreign import javascript unsafe "$1.depthRange($2, $3)"
    depthRange :: WebGLRenderingContext -> GLclampf -> GLclampf -> IO ()

foreign import javascript unsafe "$1.detachShader($2, $3)"
    detachShader :: WebGLRenderingContext -> WebGLProgram -> WebGLShader -> IO ()

foreign import javascript unsafe "$1.disable($2)"
    disable :: WebGLRenderingContext -> GLenum -> IO ()

foreign import javascript unsafe "$1.disableVertexAttribArray($2)"
    disableVertexAttribArray :: WebGLRenderingContext -> GLuint -> IO ()

foreign import javascript unsafe "$1.drawArrays($2, $3, $4)"
    drawArrays :: WebGLRenderingContext -> GLenum -> GLint -> GLsizei -> IO ()

foreign import javascript unsafe "$1.drawElements($2, $3, $4, $5)"
    drawElements :: WebGLRenderingContext -> GLenum -> GLsizei -> GLenum -> GLintptr -> IO ()

foreign import javascript unsafe "$1.enable($2)"
    enable :: WebGLRenderingContext -> GLenum -> IO ()

foreign import javascript unsafe "$1.enableVertexAttribArray($2)"
    enableVertexAttribArray :: WebGLRenderingContext -> GLuint -> IO ()

foreign import javascript unsafe "$1.finish()"
    finish :: WebGLRenderingContext -> IO ()

foreign import javascript unsafe "$1.flush()"
    flush :: WebGLRenderingContext -> IO ()

foreign import javascript unsafe "$1.framebufferRenderbuffer($2, $3, $4, $5)"
    framebufferRenderbuffer :: WebGLRenderingContext -> GLenum -> GLenum -> GLenum -> WebGLRenderbuffer -> IO ()

foreign import javascript unsafe "$1.framebufferTexture2D($2, $3, $4, $5, $6)"
    framebufferTexture2D :: WebGLRenderingContext -> GLenum -> GLenum -> GLenum -> WebGLTexture -> GLint-> IO ()

foreign import javascript unsafe "$1.frontFace($2)"
    frontFace :: WebGLRenderingContext -> GLenum -> IO ()

foreign import javascript unsafe "$1.generateMipmap($2)"
    generateMipmap :: WebGLRenderingContext -> GLenum -> IO ()

--WebGLActiveInfo? getActiveAttrib(WebGLProgram? WebGLProgram, GLuint index)
foreign import javascript unsafe "$1.getActiveAttrib($2, $3)"
    getActiveAttrib :: WebGLRenderingContext -> WebGLProgram -> GLuint -> IO WebGLActiveInfo

foreign import javascript unsafe "$1.getActiveUniform($2, $3)"
    getActiveUniform :: WebGLRenderingContext -> WebGLProgram -> GLuint -> IO WebGLActiveInfo

{-
foreign import javascript unsafe "$1.getAttachedShaders($2)"
    getAttachedShaders :: WebGLRenderingContext -> WebGLProgram -> IO (Sequence WebGLShader)
-}

foreign import javascript unsafe "$1.getAttribLocation($2, $3)"
    getAttribLocation :: WebGLRenderingContext -> WebGLProgram -> JSString -> IO GLint

foreign import javascript unsafe "$1.getBufferParameter($2, $3)"
    getBufferParameter :: WebGLRenderingContext -> GLenum -> GLenum -> IO JSVal

foreign import javascript unsafe "$1.getParameter($2)"
    getParameter :: WebGLRenderingContext -> GLenum -> IO JSVal

foreign import javascript unsafe "$1.getError()"
    getError :: WebGLRenderingContext -> IO GLenum

foreign import javascript unsafe "$1.getFramebufferAttachmentParameter($2, $3)"
    getFramebufferAttachmentParameter :: WebGLRenderingContext -> GLenum -> GLenum -> IO GLenum

--any getProgramParameter(WebGLProgram? WebGLProgram, GLenum pname)
foreign import javascript unsafe "$1.getProgramParameter($2, $3)"
    getProgramParameter :: WebGLRenderingContext -> WebGLProgram -> GLenum -> IO JSVal

foreign import javascript unsafe "$1.getProgramInfoLog($2)"
    getProgramInfoLog :: WebGLRenderingContext -> WebGLProgram -> IO JSString

foreign import javascript unsafe "$1.getRenderbufferParameter($2, $3)"
    getRenderbufferParameter :: WebGLRenderingContext -> GLenum -> GLenum -> IO JSVal

foreign import javascript unsafe "$1.getShaderParameter($2, $3)"
    getShaderParameter :: WebGLRenderingContext -> WebGLShader -> GLenum -> IO JSVal

foreign import javascript unsafe "$1.getShaderPrecisionFormat($2, $3)"
    getShaderPrecisionFormat :: WebGLRenderingContext -> GLenum -> GLenum -> IO WebGLShaderPrecisionFormat

foreign import javascript unsafe "$1.getShaderInfoLog($2)"
    getShaderInfoLog :: WebGLRenderingContext -> WebGLShader -> IO JSString

foreign import javascript unsafe "$1.getShaderSource($2)"
    getShaderSource :: WebGLRenderingContext -> WebGLShader -> IO JSString

foreign import javascript unsafe "$1.getTexParameter($2, $3)"
    getTexParameter :: WebGLRenderingContext -> GLenum -> GLenum -> IO JSVal

foreign import javascript unsafe "$1.getUniform($2, $3)"
    getUniform :: WebGLRenderingContext -> WebGLProgram -> WebGLUniformLocation -> IO JSVal

foreign import javascript unsafe "$1.getUniformLocation($2, $3)"
    getUniformLocation :: WebGLRenderingContext -> WebGLProgram -> JSString -> IO WebGLUniformLocation

foreign import javascript unsafe "$1.getVertexAttrib($2, $3)"
    getVertexAttrib :: WebGLRenderingContext -> GLuint -> GLenum -> IO JSVal

foreign import javascript unsafe "$1.getVertexAttribOffset($2, $3)"
    getVertexAttribOffset :: WebGLRenderingContext -> GLuint -> GLenum -> IO GLsizeiptr --GLsizeiptr

foreign import javascript unsafe "$1.hint($2, $3)"
    hint :: WebGLRenderingContext -> GLenum -> GLenum -> IO ()

foreign import javascript unsafe "$1.isBuffer($2)"
    isBuffer :: WebGLRenderingContext -> WebGLBuffer -> IO GLboolean

foreign import javascript unsafe "$1.isEnabled($2)"
    isEnabled :: WebGLRenderingContext -> GLenum -> IO GLboolean

foreign import javascript unsafe "$1.isFramebuffer($2)"
    isFramebuffer :: WebGLRenderingContext -> WebGLFramebuffer -> IO GLboolean

foreign import javascript unsafe "$1.isProgram($2)"
    isProgram :: WebGLRenderingContext -> WebGLProgram -> IO GLboolean

foreign import javascript unsafe "$1.isRenderbuffer($2)"
    isRenderbuffer :: WebGLRenderingContext -> WebGLRenderbuffer -> IO GLboolean

foreign import javascript unsafe "$1.isShader($2)"
    isShader :: WebGLRenderingContext -> WebGLShader -> IO GLboolean

foreign import javascript unsafe "$1.isTexture($2)"
    isTexture :: WebGLRenderingContext -> WebGLTexture -> IO GLboolean

foreign import javascript unsafe "$1.lineWidth($2)"
    lineWidth :: WebGLRenderingContext -> GLfloat -> IO ()

foreign import javascript unsafe "$1.linkProgram($2)"
    linkProgram :: WebGLRenderingContext -> WebGLProgram -> IO ()

foreign import javascript unsafe "$1.pixelStorei($2, $3)"
    pixelStorei :: WebGLRenderingContext -> GLenum -> GLint-> IO ()

foreign import javascript unsafe "$1.polygonOffset($2, $3)"
    polygonOffset :: WebGLRenderingContext -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.readPixels($2, $3, $4, $5, $6, $7, $8)"
    js_readPixels :: WebGLRenderingContext -> GLint-> GLint-> GLsizei-> GLsizei-> GLenum -> GLenum -> JSVal -> IO ()
readPixels :: WebGLRenderingContext -> GLint-> GLint-> GLsizei-> GLsizei-> GLenum -> GLenum -> IODataFrame t (ds::[Nat]) -> IO ()
readPixels a b c d e f g = js_readPixels a b c d e f g . unsafeCoerce

foreign import javascript unsafe "$1.renderbufferStorage($2, $3, $4, $5)"
    renderbufferStorage :: WebGLRenderingContext -> GLenum -> GLenum -> GLsizei -> GLsizei -> IO ()

foreign import javascript unsafe "$1.sampleCoverage($2, $3)"
    sampleCoverage :: WebGLRenderingContext -> GLclampf -> GLboolean -> IO ()

foreign import javascript unsafe "$1.scissor($2, $3, $4, $5)"
    scissor :: WebGLRenderingContext -> GLint -> GLint -> GLsizei -> GLsizei -> IO ()

foreign import javascript unsafe "$1.shaderSource($2, $3)"
    shaderSource :: WebGLRenderingContext -> WebGLShader -> JSString -> IO ()

foreign import javascript unsafe "$1.stencilFunc($2, $3, $4)"
    stencilFunc :: WebGLRenderingContext -> GLenum -> GLint-> GLuint -> IO ()

foreign import javascript unsafe "$1.stencilFuncSeparate($2, $3, $4, $5)"
    stencilFuncSeparate :: WebGLRenderingContext -> GLenum -> GLenum -> GLint-> GLuint -> IO ()

foreign import javascript unsafe "$1.stencilMask($2)"
    stencilMask :: WebGLRenderingContext -> GLuint -> IO ()

foreign import javascript unsafe "$1.stencilMaskSeparate($2, $3)"
    stencilMaskSeparate :: WebGLRenderingContext -> GLenum -> GLuint -> IO ()

foreign import javascript unsafe "$1.stencilOp($2, $3, $4)"
    stencilOp :: WebGLRenderingContext -> GLenum -> GLenum -> GLenum -> IO ()

foreign import javascript unsafe "$1.stencilOpSeparate($2, $3, $4, $5)"
    stencilOpSeparate :: WebGLRenderingContext -> GLenum -> GLenum -> GLenum -> GLenum -> IO ()

-- | void texImage2D(GLenum target, GLint level, GLenum internalformat, GLsizei width, GLsizei height
--   , GLint border, GLenum format, GLenum type, ArrayBufferView? pixels)
texImage2D :: WebGLRenderingContext -> GLenum -> GLint-> GLenum -> GLsizei-> GLsizei-> GLint-> GLenum -> GLenum -> Maybe (DataFrame t (ds::[Nat])) -> IO ()
texImage2D a1 a2 a3 a4 a5 a6 a7 a8 a9 (Just a10) = texImage2D' a1 a2 a3 a4 a5 a6 a7 a8 a9 (unsafeCoerce a10)
texImage2D a1 a2 a3 a4 a5 a6 a7 a8 a9 Nothing    = texImage2D' a1 a2 a3 a4 a5 a6 a7 a8 a9 nullRef

foreign import javascript unsafe "$1.texImage2D($2, $3, $4, $5, $6, $7, $8, $9, $10)"
    texImage2D' :: WebGLRenderingContext -> GLenum -> GLint-> GLenum -> GLsizei-> GLsizei-> GLint-> GLenum -> GLenum -> JSVal -> IO ()


-- | void texImage2D(GLenum target, GLint level, GLenum internalformat, GLenum format, GLenum type, TexImageSource? source)
foreign import javascript unsafe "$1.texImage2D($2, $3, $4, $5, $6, $7)"
    texImage2DImg :: WebGLRenderingContext -> GLenum -> GLint-> GLenum -> GLenum -> GLenum -> TexImageSource -> IO ()


{-
foreign import javascript unsafe "$1.texImage2D()"
    texImage2D :: WebGLRenderingContext -> GLenum -> GLint-> GLenum -> GLenum -> GLenum -> CanvasElement -> Void

foreign import javascript unsafe "$1.texImage2D()"
    texImage2D :: WebGLRenderingContext -> GLenum -> GLint-> GLenum -> GLenum -> GLenum -> VideoElement -> Void
-}

foreign import javascript unsafe "$1.texParameterf($2, $3, $4)"
    texParameterf :: WebGLRenderingContext -> GLenum -> GLenum -> GLfloat -> IO ()

foreign import javascript unsafe "$1.texParameteri($2, $3, $4)"
    texParameteri :: WebGLRenderingContext -> GLenum -> GLenum -> GLint-> IO ()

foreign import javascript unsafe "$1.texSubImage2D($2, $3, $4, $5, $6, $7, $8, $9, $10)"
    js_texSubImage2D :: WebGLRenderingContext -> GLenum -> GLint-> GLint-> GLint-> GLsizei-> GLsizei-> GLenum -> GLenum -> JSVal -> IO ()
texSubImage2D :: WebGLRenderingContext -> GLenum -> GLint-> GLint-> GLint-> GLsizei-> GLsizei-> GLenum -> GLenum -> DataFrame t (ds::[Nat]) -> IO ()
texSubImage2D a1 a2 a3 a4 a5 a6 a7 a8 a9 = js_texSubImage2D a1 a2 a3 a4 a5 a6 a7 a8 a9 . unsafeCoerce

{-

foreign import javascript unsafe "$1.texSubImage2D()"
    texSubImage2D :: WebGLRenderingContext -> GLenum -> GLint-> GLint-> GLint-> GLenum -> GLenum -> CanvasElement -> Void

foreign import javascript unsafe "$1.texSubImage2D()"
    texSubImage2D :: WebGLRenderingContext -> GLenum -> GLint-> GLint-> GLint-> GLenum -> GLenum -> VideoElement -> Void

-}

foreign import javascript unsafe "$1.uniform1f($2, $3)"
    uniform1f :: WebGLRenderingContext -> WebGLUniformLocation -> GLfloat -> IO ()

--foreign import javascript unsafe "$1.uniform1fv($2, $3)"
--    js_uniform1fv :: WebGLRenderingContext -> WebGLUniformLocation -> DataFrame GLfloat ('[1] :: [Nat]) -> IO ()
uniform1fv :: WebGLRenderingContext -> WebGLUniformLocation -> DataFrame GLfloat ('[] :: [Nat]) -> IO ()
uniform1fv a b = uniform1f a b . unScalar

{-
foreign import javascript unsafe "$1.uniform1fv($2 Sequence GLfloat ->)"
    uniform1fv :: WebGLRenderingContext -> WebGLUniformLocation -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.uniform1i($2, $3)"
    uniform1i :: WebGLRenderingContext -> WebGLUniformLocation -> GLint -> IO ()

--foreign import javascript unsafe "$1.uniform1iv($2, $3)"
--    uniform1iv :: WebGLRenderingContext -> WebGLUniformLocation -> DataFrame GLint '[1] -> IO ()
uniform1iv :: WebGLRenderingContext -> WebGLUniformLocation -> DataFrame GLint ('[] :: [Nat]) -> IO ()
uniform1iv a b = uniform1i a b . unScalar

{-
foreign import javascript unsafe "$1.uniform1iv($2 Sequence GLint->)"
    uniform1iv :: WebGLRenderingContext -> WebGLUniformLocation -> Sequence GLint-> IO ()
-}

foreign import javascript unsafe "$1.uniform2f($2, $3, $4)"
    uniform2f :: WebGLRenderingContext -> WebGLUniformLocation -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.uniform2fv($2, $3)"
    js_uniform2fv :: WebGLRenderingContext -> WebGLUniformLocation -> JSVal -> IO ()
uniform2fv :: WebGLRenderingContext -> WebGLUniformLocation -> DataFrame GLfloat '[2] -> IO ()
uniform2fv a b = js_uniform2fv a b . unsafeCoerce

{-
foreign import javascript unsafe "$1.uniform2fv($2 Sequence GLfloat ->)"
    uniform2fv :: WebGLRenderingContext -> WebGLUniformLocation -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.uniform2i($2, $3, $4)"
    uniform2i :: WebGLRenderingContext -> WebGLUniformLocation -> GLint-> GLint-> IO ()

foreign import javascript unsafe "$1.uniform2iv($2, $3)"
    js_uniform2iv :: WebGLRenderingContext -> WebGLUniformLocation -> JSVal -> IO ()
uniform2iv :: WebGLRenderingContext -> WebGLUniformLocation -> DataFrame GLint '[2] -> IO ()
uniform2iv a b = js_uniform2iv a b . unsafeCoerce

{-
foreign import javascript unsafe "$1.uniform2iv($2 Sequence GLint->)"
    uniform2iv :: WebGLRenderingContext -> WebGLUniformLocation -> Sequence GLint-> IO ()
-}

foreign import javascript unsafe "$1.uniform3f($2, $3, $4, $5)"
    uniform3f :: WebGLRenderingContext -> WebGLUniformLocation -> GLfloat -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.uniform3fv($2, $3)"
    js_uniform3fv :: WebGLRenderingContext -> WebGLUniformLocation -> JSVal -> IO ()
uniform3fv :: WebGLRenderingContext -> WebGLUniformLocation -> DataFrame GLfloat '[3] -> IO ()
uniform3fv a b = js_uniform3fv a b . unsafeCoerce

{-
foreign import javascript unsafe "$1.uniform3fv($2 Sequence GLfloat ->)"
    uniform3fv :: WebGLRenderingContext -> WebGLUniformLocation -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.uniform3i($2, $3, $4, $5)"
    uniform3i :: WebGLRenderingContext -> WebGLUniformLocation -> GLint-> GLint-> GLint-> IO ()

foreign import javascript unsafe "$1.uniform3iv($2, $3)"
    js_uniform3iv :: WebGLRenderingContext -> WebGLUniformLocation -> JSVal -> IO ()
uniform3iv :: WebGLRenderingContext -> WebGLUniformLocation -> DataFrame GLfloat '[3] -> IO ()
uniform3iv a b = js_uniform3iv a b . unsafeCoerce

{-
foreign import javascript unsafe "$1.uniform3iv($2 Sequence GLint->)"
    uniform3iv :: WebGLRenderingContext -> WebGLUniformLocation -> Sequence GLint-> IO ()
-}

foreign import javascript unsafe "$1.uniform4f($2, $3, $4, $5, $6)"
    uniform4f :: WebGLRenderingContext -> WebGLUniformLocation -> GLfloat -> GLfloat -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.uniform4fv($2, $3)"
    js_uniform4fv :: WebGLRenderingContext -> WebGLUniformLocation -> JSVal -> IO ()
uniform4fv :: WebGLRenderingContext -> WebGLUniformLocation -> DataFrame GLfloat '[4] -> IO ()
uniform4fv a b = js_uniform4fv a b . unsafeCoerce

{-
foreign import javascript unsafe "$1.uniform4fv($2 Sequence GLfloat ->)"
    uniform4fv :: WebGLRenderingContext -> WebGLUniformLocation -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.uniform4i($2, $3, $4, $5, $6)"
    uniform4i :: WebGLRenderingContext -> WebGLUniformLocation -> GLint-> GLint-> GLint-> GLint-> IO ()

foreign import javascript unsafe "$1.uniform4iv($2, $3)"
    js_uniform4iv :: WebGLRenderingContext -> WebGLUniformLocation -> JSVal -> IO ()
uniform4iv :: WebGLRenderingContext -> WebGLUniformLocation -> DataFrame GLint '[4] -> IO ()
uniform4iv a b = js_uniform4iv a b . unsafeCoerce

{-
foreign import javascript unsafe "$1.uniform4iv($2 Sequence GLint->)"
    uniform4iv :: WebGLRenderingContext -> WebGLUniformLocation -> Sequence GLint-> IO ()
-}

foreign import javascript unsafe "$1.uniformMatrix2fv($2, $3, $4)"
    js_uniformMatrix2fv :: WebGLRenderingContext -> WebGLUniformLocation -> Bool -> JSVal -> IO ()
uniformMatrix2fv :: WebGLRenderingContext -> WebGLUniformLocation -> Bool -> DataFrame GLfloat '[2,2] -> IO ()
uniformMatrix2fv a b c = js_uniformMatrix2fv a b c . unsafeCoerce

{-
foreign import javascript unsafe "$1.uniformMatrix2fv($2, $3 Sequence GLfloat ->)"
    uniformMatrix2fv :: WebGLRenderingContext -> WebGLUniformLocation -> Bool -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.uniformMatrix3fv($2, $3, $4)"
    js_uniformMatrix3fv :: WebGLRenderingContext -> WebGLUniformLocation -> Bool -> JSVal -> IO ()
uniformMatrix3fv :: WebGLRenderingContext -> WebGLUniformLocation -> Bool -> DataFrame GLfloat '[3,3] -> IO ()
uniformMatrix3fv a b c = js_uniformMatrix3fv a b c . unsafeCoerce


{-
foreign import javascript unsafe "$1.uniformMatrix3fv($2, $3 Sequence GLfloat ->)"
    uniformMatrix3fv :: WebGLRenderingContext -> WebGLUniformLocation -> Bool -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.uniformMatrix4fv($2, $3, $4)"
    js_uniformMatrix4fv :: WebGLRenderingContext -> WebGLUniformLocation -> Bool -> JSVal -> IO ()
uniformMatrix4fv :: WebGLRenderingContext -> WebGLUniformLocation -> Bool -> DataFrame GLfloat '[4,4] -> IO ()
uniformMatrix4fv a b c = js_uniformMatrix4fv a b c . unsafeCoerce


-- SomeTypedArray m GLfloat

{-
foreign import javascript unsafe "$1.uniformMatrix4fv($2, $3 Sequence GLfloat ->)"
    uniformMatrix4fv :: WebGLRenderingContext -> WebGLUniformLocation -> Bool -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.useProgram($2)"
    useProgram :: WebGLRenderingContext -> WebGLProgram -> IO ()

foreign import javascript unsafe "$1.validateProgram($2)"
    validateProgram :: WebGLRenderingContext -> WebGLProgram -> IO ()

foreign import javascript unsafe "$1.vertexAttrib1f($2, $3)"
    vertexAttrib1f :: WebGLRenderingContext -> GLuint -> GLfloat -> IO ()

--foreign import javascript unsafe "$1.vertexAttrib1fv($2, $3)"
--    vertexAttrib1fv :: WebGLRenderingContext -> GLuint -> DataFrame GLfloat '[1] -> IO ()
vertexAttrib1fv :: WebGLRenderingContext -> GLuint -> DataFrame GLfloat ('[]::[Nat]) -> IO ()
vertexAttrib1fv a b = vertexAttrib1f a b . unScalar

{-
foreign import javascript unsafe "$1.vertexAttrib1fv($2 Sequence GLfloat ->)"
    vertexAttrib1fv :: WebGLRenderingContext -> GLuint -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.vertexAttrib2f($2, $3, $4)"
    vertexAttrib2f :: WebGLRenderingContext -> GLuint -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.vertexAttrib2fv($2, $3)"
    js_vertexAttrib2fv :: WebGLRenderingContext -> GLuint -> JSVal -> IO ()
vertexAttrib2fv :: WebGLRenderingContext -> GLuint -> DataFrame GLfloat '[2] -> IO ()
vertexAttrib2fv a b = js_vertexAttrib2fv a b . unsafeCoerce


{-
foreign import javascript unsafe "$1.vertexAttrib2fv($2 Sequence GLfloat ->)"
    vertexAttrib2fv :: WebGLRenderingContext -> GLenum -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.vertexAttrib3f($2, $3, $4, $5)"
    vertexAttrib3f :: WebGLRenderingContext -> GLuint -> GLfloat -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.vertexAttrib3fv($2, $3)"
    js_vertexAttrib3fv :: WebGLRenderingContext -> GLuint -> JSVal -> IO ()
vertexAttrib3fv :: WebGLRenderingContext -> GLuint -> DataFrame GLfloat '[3] -> IO ()
vertexAttrib3fv a b = js_vertexAttrib3fv a b . unsafeCoerce

{-
foreign import javascript unsafe "$1.vertexAttrib3fv($2 Sequence GLfloat ->)"
    vertexAttrib3fv :: WebGLRenderingContext -> GLenum -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.vertexAttrib4f($2, $3, $4, $5, $6)"
    vertexAttrib4f :: WebGLRenderingContext -> GLuint -> GLfloat -> GLfloat -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.vertexAttrib4fv($2, $3)"
    js_vertexAttrib4fv :: WebGLRenderingContext -> GLuint -> JSVal -> IO ()
vertexAttrib4fv :: WebGLRenderingContext -> GLuint -> DataFrame GLfloat '[4] -> IO ()
vertexAttrib4fv a b = js_vertexAttrib4fv a b . unsafeCoerce


{-
foreign import javascript unsafe "$1.vertexAttrib4fv($2 Sequence GLfloat ->)"
    vertexAttrib4fv :: WebGLRenderingContext -> GLuint -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.vertexAttribPointer($2, $3, $4, $5, $6, $7)"
    vertexAttribPointer :: WebGLRenderingContext -> GLuint -> GLint-> GLenum -> GLboolean -> GLsizei -> GLintptr -> IO ()

foreign import javascript unsafe "$1.viewport($2, $3, $4, $5)"
    viewport :: WebGLRenderingContext -> GLint-> GLint-> GLsizei-> GLsizei-> IO ()



-- | Get Javascript WebGL Context from html canvas element
foreign import javascript unsafe "$r = ($1.getContext(\"webgl\")) ? $1.getContext(\"webgl\") : $1.getContext(\"experimental-webgl\");"
    getWebGLContext :: Canvas -> IO WebGLRenderingContext

