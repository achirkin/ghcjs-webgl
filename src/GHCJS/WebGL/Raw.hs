-----------------------------------------------------------------------------
-- |
-- Module      :  GHCJS.WebGL.Raw
-- Copyright   :  Copyright (C) 2015 Artem M. Chirkin <chirkin@arch.ethz.ch>
-- License     :  BSD3
--
-- Maintainer  :  Artem M. Chirkin <chirkin@arch.ethz.ch>
-- Stability   :  Experimental
--
-- Functions in WebGL 1.0 spec.
-- https://www.khronos.org/registry/webgl/specs/1.0/
--
-----------------------------------------------------------------------------

module GHCJS.WebGL.Raw where

import Data.Int ()

import GHCJS.Types

import GHCJS.WebGL.Types

import Unsafe.Coerce (unsafeCoerce)


foreign import javascript unsafe "$1.activeTexture($2)"
    activeTexture :: Ctx -> GLenum -> IO ()

foreign import javascript unsafe "$1.attachShader($2, $3)"
    attachShader :: Ctx -> Program -> Shader -> IO ()

foreign import javascript unsafe "$1.bindAttribLocation($2, $3, $4)"
    bindAttribLocation :: Ctx -> Program -> GLuint -> JSString -> IO ()

foreign import javascript unsafe "$1.bindBuffer($2, $3)"
    bindBuffer :: Ctx -> GLenum -> Buffer -> IO ()

foreign import javascript unsafe "$1.bindFramebuffer($2, $3)"
    bindFramebuffer :: Ctx -> GLenum -> FrameBuffer -> IO ()

foreign import javascript unsafe "$1.bindRenderbuffer($2, $3)"
    bindRenderbuffer :: Ctx -> GLenum -> RenderBuffer -> IO ()

foreign import javascript unsafe "$1.bindTexture($2, $3)"
    bindTexture :: Ctx -> GLenum -> Texture -> IO ()

foreign import javascript unsafe "$1.blendColor($2, $3, $4, $5)"
    blendColor :: Ctx -> GLclampf -> GLclampf -> GLclampf -> GLclampf -> IO ()

foreign import javascript unsafe "$1.blendEquation($2)"
    blendEquation :: Ctx -> GLenum -> IO ()

foreign import javascript unsafe "$1.blendEquationSeparate($2, $3)"
    blendEquationSeparate :: Ctx -> GLenum -> GLenum -> IO ()

foreign import javascript unsafe "$1.blendFunc($2, $3)"
    blendFunc :: Ctx -> GLenum -> GLenum -> IO ()

foreign import javascript unsafe "$1.blendFuncSeparate($2, $3, $4, $5)"
    blendFuncSeparate :: Ctx -> GLenum -> GLenum -> GLenum -> GLenum -> IO ()

{-
foreign import javascript unsafe "$1.bufferData($2, $3, $4)"
    bufferData :: Ctx -> GLenum -> GLsizeiptr -> GLenum -> IO ()
-}

--foreign import javascript unsafe "$1.bufferData($2, $3, $4)"
--    bufferData :: Ctx -> GLenum -> ArrayBufferView -> GLenum -> IO ()


foreign import javascript unsafe "$1.bufferData($2, $3.buf, $4)"
    bufferData' :: Ctx -> GLenum -> JSRef ArrayBuffer -> GLenum -> IO ()

bufferData :: Ctx -> GLenum -> ArrayBuffer -> GLenum -> IO ()
bufferData gl t buf dr = bufferData' gl t (unsafeCoerce buf) dr

{-
foreign import javascript unsafe "$1.bufferData($2, $3, $4)"
    bufferData :: Ctx -> GLenum -> ArrayBuffer -> GLenum -> IO ()
-}

foreign import javascript unsafe "$1.bufferSubData($2, $3, $4.buf)"
    bufferSubData' :: Ctx -> GLenum -> GLintptr -> JSRef ArrayBuffer -> IO ()

bufferSubData :: Ctx -> GLenum -> GLintptr -> ArrayBuffer -> IO ()
bufferSubData a b c = bufferSubData' a b c . unsafeCoerce

{-
foreign import javascript unsafe "$1.bufferSubData($2, $3, $4)"
    bufferSubData :: Ctx -> GLenum -> GLenum -> ArrayBuffer -> IO ()
-}

foreign import javascript unsafe "$1.checkFramebufferStatus($2)"
    checkFramebufferStatus :: Ctx -> GLenum -> IO GLenum

foreign import javascript unsafe "$1.clear($2)"
    clear :: Ctx -> GLbitfield -> IO ()

foreign import javascript unsafe "$1.clearColor($2, $3, $4, $5)"
    clearColor :: Ctx -> GLclampf -> GLclampf -> GLclampf -> GLclampf -> IO ()

foreign import javascript unsafe "$1.clearDepth($2)"
    clearDepth :: Ctx -> GLclampf -> IO ()

foreign import javascript unsafe "$1.clearStencil($2)"
    clearStencil :: Ctx -> GLint-> IO ()

foreign import javascript unsafe "$1.colorMask($2, $3, $4, $5)"
    colorMask :: Ctx -> GLboolean -> GLboolean -> GLboolean -> GLboolean -> IO ()
--foreign import javascript unsafe "$1.colorMask($2, $3, $4, $5)"
--    colorMask :: Ctx -> Bool -> Bool -> Bool -> Bool -> IO ()

foreign import javascript unsafe "$1.compileShader($2)"
    compileShader :: Ctx -> Shader -> IO ()

foreign import javascript unsafe "$1.compressedTexImage2D($2, $3, $4, $5, $6, $7, $8)"
    compressedTexImage2D' :: Ctx -> GLenum -> GLint-> GLenum -> GLsizei-> GLsizei-> GLint-> TypedArray a -> IO ()

--compressedTexImage2D :: Ctx -> GLenum -> GLint-> GLenum -> GLsizei-> GLsizei-> GLint-> ArrayBuffer -> IO ()
--compressedTexImage2D q w e r t y u = compressedTexImage2D' q w e r t y u . unsafeCoerce

foreign import javascript unsafe "$1.compressedTexSubImage2D($2, $3, $4, $5, $6, $7, $8, $9)"
    compressedTexSubImage2D' :: Ctx -> GLenum -> GLint-> GLint-> GLint-> GLsizei-> GLsizei-> GLenum -> TypedArray a -> IO ()

--compressedTexSubImage2D :: Ctx -> GLenum -> GLint-> GLint-> GLint-> GLsizei-> GLsizei-> GLenum -> ArrayBuffer -> IO ()
--compressedTexSubImage2D q w e r t y u i = compressedTexSubImage2D' q w e r t y u i . unsafeCoerce

foreign import javascript unsafe "$1.copyTexImage2D($2, $3, $4, $5, $6, $7, $8, $9)"
    copyTexImage2D :: Ctx -> GLenum -> GLint -> GLenum -> GLint -> GLint -> GLsizei -> GLsizei-> GLint-> IO ()

foreign import javascript unsafe "$1.copyTexSubImage2D($2, $3, $4, $5, $6, $7, $8, $9)"
    copyTexSubImage2D :: Ctx -> GLenum -> GLint-> GLint-> GLint-> GLint-> GLint-> GLsizei-> GLsizei-> IO ()

foreign import javascript unsafe "$1.createBuffer()"
    createBuffer :: Ctx -> IO Buffer

foreign import javascript unsafe "$1.createFramebuffer()"
    createFramebuffer :: Ctx -> IO FrameBuffer

foreign import javascript unsafe "$1.createProgram()"
    createProgram :: Ctx -> IO Program

foreign import javascript unsafe "$1.createRenderbuffer()"
    createRenderbuffer :: Ctx -> IO RenderBuffer

foreign import javascript unsafe "$1.createShader($2)"
    createShader :: Ctx -> GLenum -> IO Shader

foreign import javascript unsafe "$1.createTexture()"
    createTexture :: Ctx -> IO Texture

foreign import javascript unsafe "$1.cullFace($2)"
    cullFace :: Ctx -> GLenum -> IO ()

foreign import javascript unsafe "$1.deleteBuffer($2)"
    deleteBuffer :: Ctx -> Buffer -> IO ()

foreign import javascript unsafe "$1.deleteFramebuffer($2)"
    deleteFramebuffer :: Ctx -> FrameBuffer -> IO ()

foreign import javascript unsafe "$1.deleteProgram($2)"
    deleteProgram :: Ctx -> Program -> IO ()

foreign import javascript unsafe "$1.deleteRenderbuffer($2)"
    deleteRenderbuffer :: Ctx -> RenderBuffer -> IO ()

foreign import javascript unsafe "$1.deleteShader($2)"
    deleteShader :: Ctx -> Shader -> IO ()

foreign import javascript unsafe "$1.deleteTexture($2)"
    deleteTexture :: Ctx -> Texture -> IO ()

foreign import javascript unsafe "$1.depthFunc($2)"
    depthFunc :: Ctx -> GLenum -> IO ()

foreign import javascript unsafe "$1.depthMask($2)"
    depthMask :: Ctx -> GLboolean -> IO ()

foreign import javascript unsafe "$1.depthRange($2, $3)"
    depthRange :: Ctx -> GLclampf -> GLclampf -> IO ()

foreign import javascript unsafe "$1.detachShader($2, $3)"
    detachShader :: Ctx -> Program -> Shader -> IO ()

foreign import javascript unsafe "$1.disable($2)"
    disable :: Ctx -> GLenum -> IO ()

foreign import javascript unsafe "$1.disableVertexAttribArray($2)"
    disableVertexAttribArray :: Ctx -> GLuint -> IO ()

foreign import javascript unsafe "$1.drawArrays($2, $3, $4)"
    drawArrays :: Ctx -> GLenum -> GLint -> GLsizei -> IO ()

foreign import javascript unsafe "$1.drawElements($2, $3, $4, $5)"
    drawElements :: Ctx -> GLenum -> GLsizei -> GLenum -> GLintptr -> IO ()

foreign import javascript unsafe "$1.enable($2)"
    enable :: Ctx -> GLenum -> IO ()

foreign import javascript unsafe "$1.enableVertexAttribArray($2)"
    enableVertexAttribArray :: Ctx -> GLuint -> IO ()

foreign import javascript unsafe "$1.finish()"
    finish :: Ctx -> IO ()

foreign import javascript unsafe "$1.flush()"
    flush :: Ctx -> IO ()

foreign import javascript unsafe "$1.framebufferRenderbuffer($2, $3, $4, $5)"
    framebufferRenderbuffer :: Ctx -> GLenum -> GLenum -> GLenum -> RenderBuffer -> IO ()

foreign import javascript unsafe "$1.framebufferTexture2D($2, $3, $4, $5, $6)"
    framebufferTexture2D :: Ctx -> GLenum -> GLenum -> GLenum -> Texture -> GLint-> IO ()

foreign import javascript unsafe "$1.frontFace($2)"
    frontFace :: Ctx -> GLenum -> IO ()

foreign import javascript unsafe "$1.generateMipmap($2)"
    generateMipmap :: Ctx -> GLenum -> IO ()

--WebGLActiveInfo? getActiveAttrib(WebGLProgram? program, GLuint index)
foreign import javascript unsafe "$1.getActiveAttrib($2, $3)"
    getActiveAttrib :: Ctx -> Program -> GLuint -> IO ActiveInfo

foreign import javascript unsafe "$1.getActiveUniform($2, $3)"
    getActiveUniform :: Ctx -> Program -> GLuint -> IO ActiveInfo

{-
foreign import javascript unsafe "$1.getAttachedShaders($2)"
    getAttachedShaders :: Ctx -> Program -> IO (Sequence Shader)
-}

foreign import javascript unsafe "$1.getAttribLocation($2, $3)"
    getAttribLocation :: Ctx -> Program -> JSString -> IO GLint

foreign import javascript unsafe "$1.getBufferParameter($2, $3)"
    getBufferParameter :: Ctx -> GLenum -> GLenum -> IO (JSRef a)

foreign import javascript unsafe "$1.getParameter($2)"
    getParameter :: Ctx -> GLenum -> IO (JSRef a)

foreign import javascript unsafe "$1.getError()"
    getError :: Ctx -> IO GLenum

foreign import javascript unsafe "$1.getFramebufferAttachmentParameter($2, $3)"
    getFramebufferAttachmentParameter :: Ctx -> GLenum -> GLenum -> IO GLenum

--any getProgramParameter(WebGLProgram? program, GLenum pname)
foreign import javascript unsafe "$1.getProgramParameter($2, $3)"
    getProgramParameter :: Ctx -> Program -> GLenum -> IO (JSRef a)

foreign import javascript unsafe "$1.getProgramInfoLog($2)"
    getProgramInfoLog :: Ctx -> Program -> IO JSString

foreign import javascript unsafe "$1.getRenderbufferParameter($2, $3)"
    getRenderbufferParameter :: Ctx -> GLenum -> GLenum -> IO (JSRef a)

foreign import javascript unsafe "$1.getShaderParameter($2, $3)"
    getShaderParameter :: Ctx -> Shader -> GLenum -> IO (JSRef a)

foreign import javascript unsafe "$1.getShaderPrecisionFormat($2, $3)"
    getShaderPrecisionFormat :: Ctx -> GLenum -> GLenum -> IO ShaderPrecisionFormat

foreign import javascript unsafe "$1.getShaderInfoLog($2)"
    getShaderInfoLog :: Ctx -> Shader -> IO JSString

foreign import javascript unsafe "$1.getShaderSource($2)"
    getShaderSource :: Ctx -> Shader -> IO JSString

foreign import javascript unsafe "$1.getTexParameter($2, $3)"
    getTexParameter :: Ctx -> GLenum -> GLenum -> IO (JSRef a)

foreign import javascript unsafe "$1.getUniform($2, $3)"
    getUniform :: Ctx -> Program -> UniformLocation -> IO (JSRef a)

foreign import javascript unsafe "$1.getUniformLocation($2, $3)"
    getUniformLocation :: Ctx -> Program -> JSString -> IO UniformLocation

foreign import javascript unsafe "$1.getVertexAttrib($2, $3)"
    getVertexAttrib :: Ctx -> GLuint -> GLenum -> IO (JSRef a)

foreign import javascript unsafe "$1.getVertexAttribOffset($2, $3)"
    getVertexAttribOffset :: Ctx -> GLuint -> GLenum -> IO GLsizeiptr --GLsizeiptr

foreign import javascript unsafe "$1.hint($2, $3)"
    hint :: Ctx -> GLenum -> GLenum -> IO ()

foreign import javascript unsafe "$1.isBuffer($2)"
    isBuffer :: Ctx -> Buffer -> IO GLboolean

foreign import javascript unsafe "$1.isEnabled($2)"
    isEnabled :: Ctx -> GLenum -> IO GLboolean

foreign import javascript unsafe "$1.isFramebuffer($2)"
    isFramebuffer :: Ctx -> FrameBuffer -> IO GLboolean

foreign import javascript unsafe "$1.isProgram($2)"
    isProgram :: Ctx -> Program -> IO GLboolean

foreign import javascript unsafe "$1.isRenderbuffer($2)"
    isRenderbuffer :: Ctx -> RenderBuffer -> IO GLboolean

foreign import javascript unsafe "$1.isShader($2)"
    isShader :: Ctx -> Shader -> IO GLboolean

foreign import javascript unsafe "$1.isTexture($2)"
    isTexture :: Ctx -> Texture -> IO GLboolean

foreign import javascript unsafe "$1.lineWidth($2)"
    lineWidth :: Ctx -> GLfloat -> IO ()

foreign import javascript unsafe "$1.linkProgram($2)"
    linkProgram :: Ctx -> Program -> IO ()

foreign import javascript unsafe "$1.pixelStorei($2, $3)"
    pixelStorei :: Ctx -> GLenum -> GLint-> IO ()

foreign import javascript unsafe "$1.polygonOffset($2, $3)"
    polygonOffset :: Ctx -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.readPixels($2, $3, $4, $5, $6, $7, $8)"
    readPixels :: Ctx -> GLint-> GLint-> GLsizei-> GLsizei-> GLenum -> GLenum -> TypedArray a -> IO ()


--readPixels :: Ctx -> GLint-> GLint-> GLsizei-> GLsizei-> GLenum -> GLenum -> ArrayBuffer -> IO ()
--readPixels q w e r t y u = readPixels' q w e r t y u . unsafeCoerce

foreign import javascript unsafe "$1.renderbufferStorage($2, $3, $4, $5)"
    renderbufferStorage :: Ctx -> GLenum -> GLenum -> GLsizei -> GLsizei -> IO ()

foreign import javascript unsafe "$1.sampleCoverage($2, $3)"
    sampleCoverage :: Ctx -> GLclampf -> GLboolean -> IO ()

foreign import javascript unsafe "$1.scissor($2, $3, $4, $5)"
    scissor :: Ctx -> GLint -> GLint -> GLsizei -> GLsizei -> IO ()

foreign import javascript unsafe "$1.shaderSource($2, $3)"
    shaderSource :: Ctx -> Shader -> JSString -> IO ()

foreign import javascript unsafe "$1.stencilFunc($2, $3, $4)"
    stencilFunc :: Ctx -> GLenum -> GLint-> GLuint -> IO ()

foreign import javascript unsafe "$1.stencilFuncSeparate($2, $3, $4, $5)"
    stencilFuncSeparate :: Ctx -> GLenum -> GLenum -> GLint-> GLuint -> IO ()

foreign import javascript unsafe "$1.stencilMask($2)"
    stencilMask :: Ctx -> GLuint -> IO ()

foreign import javascript unsafe "$1.stencilMaskSeparate($2, $3)"
    stencilMaskSeparate :: Ctx -> GLenum -> GLuint -> IO ()

foreign import javascript unsafe "$1.stencilOp($2, $3, $4)"
    stencilOp :: Ctx -> GLenum -> GLenum -> GLenum -> IO ()

foreign import javascript unsafe "$1.stencilOpSeparate($2, $3, $4, $5)"
    stencilOpSeparate :: Ctx -> GLenum -> GLenum -> GLenum -> GLenum -> IO ()

-- | void texImage2D(GLenum target, GLint level, GLenum internalformat, GLsizei width, GLsizei height
--   , GLint border, GLenum format, GLenum type, ArrayBufferView? pixels)
foreign import javascript unsafe "$1.texImage2D($2, $3, $4, $5, $6, $7, $8, $9, $10)"
    texImage2D :: Ctx -> GLenum -> GLint-> GLenum -> GLsizei-> GLsizei-> GLint-> GLenum -> GLenum -> TypedArray a -> IO ()

-- | void texImage2D(GLenum target, GLint level, GLenum internalformat, GLenum format, GLenum type, TexImageSource? source)
foreign import javascript unsafe "$1.texImage2D($2, $3, $4, $5, $6, $7)"
    texImage2DImg :: Ctx -> GLenum -> GLint-> GLenum -> GLenum -> GLenum -> TexImageSource -> IO ()

--texImage2D :: Ctx -> GLenum -> GLint-> GLenum -> GLsizei-> GLsizei-> GLint-> GLenum -> GLenum -> ArrayBuffer -> IO ()
--texImage2D q w e r t y u i o = texImage2D' q w e r t y u i o . unsafeCoerce

{-
foreign import javascript unsafe "$1.texImage2D()"
    texImage2D :: Ctx -> GLenum -> GLint-> GLenum -> GLenum -> GLenum -> CanvasElement -> Void

foreign import javascript unsafe "$1.texImage2D()"
    texImage2D :: Ctx -> GLenum -> GLint-> GLenum -> GLenum -> GLenum -> VideoElement -> Void
-}

foreign import javascript unsafe "$1.texParameterf($2, $3, $4)"
    texParameterf :: Ctx -> GLenum -> GLenum -> GLfloat -> IO ()

foreign import javascript unsafe "$1.texParameteri($2, $3, $4)"
    texParameteri :: Ctx -> GLenum -> GLenum -> GLint-> IO ()

foreign import javascript unsafe "$1.texSubImage2D($2, $3, $4, $5, $6, $7, $8, $9, $10)"
    texSubImage2D' :: Ctx -> GLenum -> GLint-> GLint-> GLint-> GLsizei-> GLsizei-> GLenum -> GLenum -> TypedArray a -> IO ()


--texSubImage2D :: Ctx -> GLenum -> GLint-> GLint-> GLint-> GLsizei-> GLsizei-> GLenum -> GLenum -> ArrayBuffer -> IO ()
--texSubImage2D q w e r t y u i o = texSubImage2D' q w e r t y u i o . unsafeCoerce
{-

foreign import javascript unsafe "$1.texSubImage2D()"
    texSubImage2D :: Ctx -> GLenum -> GLint-> GLint-> GLint-> GLenum -> GLenum -> CanvasElement -> Void

foreign import javascript unsafe "$1.texSubImage2D()"
    texSubImage2D :: Ctx -> GLenum -> GLint-> GLint-> GLint-> GLenum -> GLenum -> VideoElement -> Void

-}

foreign import javascript unsafe "$1.uniform1f($2, $3)"
    uniform1f :: Ctx -> UniformLocation -> GLfloat -> IO ()

foreign import javascript unsafe "$1.uniform1fv($2, $3)"
    uniform1fv :: Ctx -> UniformLocation -> TypedArray GLfloat -> IO ()

{-
foreign import javascript unsafe "$1.uniform1fv($2 Sequence GLfloat ->)"
    uniform1fv :: Ctx -> UniformLocation -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.uniform1i($2, $3)"
    uniform1i :: Ctx -> UniformLocation -> GLint-> IO ()

foreign import javascript unsafe "$1.uniform1iv($2, $3)"
    uniform1iv :: Ctx -> UniformLocation -> TypedArray GLint -> IO ()

{-
foreign import javascript unsafe "$1.uniform1iv($2 Sequence GLint->)"
    uniform1iv :: Ctx -> UniformLocation -> Sequence GLint-> IO ()
-}

foreign import javascript unsafe "$1.uniform2f($2, $3, $4)"
    uniform2f :: Ctx -> UniformLocation -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.uniform2fv($2, $3)"
    uniform2fv :: Ctx -> UniformLocation -> TypedArray GLfloat -> IO ()

{-
foreign import javascript unsafe "$1.uniform2fv($2 Sequence GLfloat ->)"
    uniform2fv :: Ctx -> UniformLocation -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.uniform2i($2, $3, $4)"
    uniform2i :: Ctx -> UniformLocation -> GLint-> GLint-> IO ()

foreign import javascript unsafe "$1.uniform2iv($2, $3)"
    uniform2iv :: Ctx -> UniformLocation -> TypedArray GLint -> IO ()

{-
foreign import javascript unsafe "$1.uniform2iv($2 Sequence GLint->)"
    uniform2iv :: Ctx -> UniformLocation -> Sequence GLint-> IO ()
-}

foreign import javascript unsafe "$1.uniform3f($2, $3, $4, $5)"
    uniform3f :: Ctx -> UniformLocation -> GLfloat -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.uniform3fv($2, $3)"
    uniform3fv :: Ctx -> UniformLocation -> TypedArray GLfloat -> IO ()

{-
foreign import javascript unsafe "$1.uniform3fv($2 Sequence GLfloat ->)"
    uniform3fv :: Ctx -> UniformLocation -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.uniform3i($2, $3, $4, $5)"
    uniform3i :: Ctx -> UniformLocation -> GLint-> GLint-> GLint-> IO ()

foreign import javascript unsafe "$1.uniform3iv($2, $3)"
    uniform3iv :: Ctx -> UniformLocation -> TypedArray GLint -> IO ()

{-
foreign import javascript unsafe "$1.uniform3iv($2 Sequence GLint->)"
    uniform3iv :: Ctx -> UniformLocation -> Sequence GLint-> IO ()
-}

foreign import javascript unsafe "$1.uniform4f($2, $3, $4, $5, $6)"
    uniform4f :: Ctx -> UniformLocation -> GLfloat -> GLfloat -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.uniform4fv($2, $3)"
    uniform4fv :: Ctx -> UniformLocation -> TypedArray GLfloat -> IO ()

{-
foreign import javascript unsafe "$1.uniform4fv($2 Sequence GLfloat ->)"
    uniform4fv :: Ctx -> UniformLocation -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.uniform4i($2, $3, $4, $5, $6)"
    uniform4i :: Ctx -> UniformLocation -> GLint-> GLint-> GLint-> GLint-> IO ()

foreign import javascript unsafe "$1.uniform4iv($2, $3)"
    uniform4iv :: Ctx -> UniformLocation -> TypedArray GLint -> IO ()

{-
foreign import javascript unsafe "$1.uniform4iv($2 Sequence GLint->)"
    uniform4iv :: Ctx -> UniformLocation -> Sequence GLint-> IO ()
-}

foreign import javascript unsafe "$1.uniformMatrix2fv($2, $3, $4)"
    uniformMatrix2fv :: Ctx -> UniformLocation -> Bool -> TypedArray GLfloat -> IO ()

{-
foreign import javascript unsafe "$1.uniformMatrix2fv($2, $3 Sequence GLfloat ->)"
    uniformMatrix2fv :: Ctx -> UniformLocation -> Bool -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.uniformMatrix3fv($2, $3, $4)"
    uniformMatrix3fv :: Ctx -> UniformLocation -> Bool -> TypedArray GLfloat -> IO ()

{-
foreign import javascript unsafe "$1.uniformMatrix3fv($2, $3 Sequence GLfloat ->)"
    uniformMatrix3fv :: Ctx -> UniformLocation -> Bool -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.uniformMatrix4fv($2, $3, $4)"
    uniformMatrix4fv :: Ctx -> UniformLocation -> Bool -> TypedArray GLfloat -> IO ()

-- TypedArray GLfloat

{-
foreign import javascript unsafe "$1.uniformMatrix4fv($2, $3 Sequence GLfloat ->)"
    uniformMatrix4fv :: Ctx -> UniformLocation -> Bool -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.useProgram($2)"
    useProgram :: Ctx -> Program -> IO ()

foreign import javascript unsafe "$1.validateProgram($2)"
    validateProgram :: Ctx -> Program -> IO ()

foreign import javascript unsafe "$1.vertexAttrib1f($2, $3)"
    vertexAttrib1f :: Ctx -> GLuint -> GLfloat -> IO ()

foreign import javascript unsafe "$1.vertexAttrib1fv($2, $3)"
    vertexAttrib1fv :: Ctx -> GLuint -> TypedArray GLfloat -> IO ()

{-
foreign import javascript unsafe "$1.vertexAttrib1fv($2 Sequence GLfloat ->)"
    vertexAttrib1fv :: Ctx -> GLuint -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.vertexAttrib2f($2, $3, $4)"
    vertexAttrib2f :: Ctx -> GLuint -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.vertexAttrib2fv($2, $3)"
    vertexAttrib2fv :: Ctx -> GLuint -> TypedArray GLfloat -> IO ()

{-
foreign import javascript unsafe "$1.vertexAttrib2fv($2 Sequence GLfloat ->)"
    vertexAttrib2fv :: Ctx -> GLenum -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.vertexAttrib3f($2, $3, $4, $5)"
    vertexAttrib3f :: Ctx -> GLuint -> GLfloat -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.vertexAttrib3fv($2, $3)"
    vertexAttrib3fv :: Ctx -> GLuint -> TypedArray GLfloat -> IO ()

{-
foreign import javascript unsafe "$1.vertexAttrib3fv($2 Sequence GLfloat ->)"
    vertexAttrib3fv :: Ctx -> GLenum -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.vertexAttrib4f($2, $3, $4, $5, $6)"
    vertexAttrib4f :: Ctx -> GLuint -> GLfloat -> GLfloat -> GLfloat -> GLfloat -> IO ()

foreign import javascript unsafe "$1.vertexAttrib4fv($2, $3)"
    vertexAttrib4fv :: Ctx -> GLuint -> TypedArray GLfloat -> IO ()

{-
foreign import javascript unsafe "$1.vertexAttrib4fv($2 Sequence GLfloat ->)"
    vertexAttrib4fv :: Ctx -> GLuint -> Sequence GLfloat -> IO ()
-}

foreign import javascript unsafe "$1.vertexAttribPointer($2, $3, $4, $5, $6, $7)"
    vertexAttribPointer :: Ctx -> GLuint -> GLint-> GLenum -> GLboolean -> GLsizei -> GLintptr -> IO ()

foreign import javascript unsafe "$1.viewport($2, $3, $4, $5)"
    viewport :: Ctx -> GLint-> GLint-> GLsizei-> GLsizei-> IO ()
