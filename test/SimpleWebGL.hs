{-# LANGUAGE OverloadedStrings #-}
{-# LANGUAGE JavaScriptFFI #-}
module Main (main) where

import Prelude hiding (unlines)
import JsHs.JSString hiding (length)


import JsHs.TypedArray
import JsHs.TypedArray.IO

import JsHs.WebGL

main :: IO ()
main = do
    -- create canvas and get context
    canvas <- addCanvasToBody 800 400
    gl <- getWebGLContext canvas
    -- set up viewport
    clearColor gl 0.1 0.2 0.4 (800/400)
    viewport gl 0 0 800 400
    -- init shaders and get attribute locations
    (matLoc, posLoc, colLoc) <- initShaders gl
    -- supply shader with uniform matrix
    uniformMatrix4fv gl matLoc False
        $ fromList [ 1, 0, 0, 0
                   , 0, 1, 0, 0
                   , 0, 0, 1, 0
                   , 0, 0, 0, 1]
    -- create objects (including sending data to device)
    trigbuf <- createBuffers gl triangle
    rectbuf <- createBuffers gl rectangle
    -- clear viewport
    clear gl gl_COLOR_BUFFER_BIT
    -- draw objects
    drawBuffers gl (posLoc,colLoc) trigbuf
    drawBuffers gl (posLoc,colLoc) rectbuf

-- | geometry data type for our test: stores coordinates, colors, and indices (for indexed drawing)
data Geometry = Geometry {
    coords ::  [[GLfloat]],
    colors ::  [[GLubyte]],
    indices :: Maybe [GLushort]
    }

rectangle :: Geometry
rectangle = Geometry {
    coords = [[ 0.05,  0.9, 0]
             ,[ 0.95,  0.9, 0]
             ,[ 0.95, -0.9, 0]
             ,[ 0.05, -0.9, 0]],
    colors = [[ 255, 0, 0  ]
             ,[ 0, 255, 0  ]
             ,[ 0,   0, 255]
             ,[ 0, 127, 127]],
    indices = Just [0,1,2,0,2,3]
    }

triangle :: Geometry
triangle = Geometry {
    coords = [[-0.95,-0.8, 0]
             ,[-0.50, 0.8, 0]
             ,[-0.05,-0.8, 0]],
    colors = [[ 255, 0, 0]
             ,[ 0, 255, 0]
             ,[ 0, 0, 255]],
    indices = Nothing
    }

-- | initialize shader program and get attribute and uniform locations
initShaders :: WebGLRenderingContext -> IO (WebGLUniformLocation, GLuint, GLuint)
initShaders gl = do
    -- create program
    shaderProgram <- createProgram gl
    -- attach all shaders
    getShader gl gl_VERTEX_SHADER vertexShaderText >>= attachShader gl shaderProgram
    getShader gl gl_FRAGMENT_SHADER fragmentShaderText >>= attachShader gl shaderProgram
    -- link program
    linkProgram gl shaderProgram
    -- get attribute locations (getAttribLocation returns GLint, but we use always GLuint)
    posLoc <- fromIntegral <$> getAttribLocation gl shaderProgram "aVertexPosition"
    colorLoc <- fromIntegral <$> getAttribLocation gl shaderProgram "aVertexColor"
    -- get uniform locations
    matLoc <- getUniformLocation gl shaderProgram "uPMV"
    -- activate shader program
    useProgram gl shaderProgram
    -- enable attributes in shaders
    enableVertexAttribArray gl posLoc
    enableVertexAttribArray gl colorLoc
    return (matLoc, posLoc, colorLoc)

-- | Helper function to load shader: create, feed source code, and compile shader
getShader :: WebGLRenderingContext -> GLenum -> JSString -> IO WebGLShader
getShader gl t src = do
    shaderId <- createShader gl t
    shaderSource gl shaderId src
    compileShader gl shaderId
    return shaderId

-- | Pack points and colors tightly in one buffer:
--   3 floats of 4 bytes each for positions,
--   4 unsigned bytes for colors (aplha is 255)
packVertColors :: [[GLfloat]] -> [[GLubyte]]
               -> IOArrayBuffer -> IO ()
packVertColors pnts cls buf = f pnts cls 0
    where f :: [[GLfloat]] -> [[GLubyte]] -> Int -> IO ()
          f (xyz:ps) (rgb:cs) i = do
            setList (4*i) xyz floatView
            setList (16*i+12) rgb byteView
            setIndex (16*i+15) 255 byteView
            f ps cs (i+1)
          f _ _ _ = return ()
          floatView = arrayView buf
          byteView  = arrayView buf

-- | Pack geometry data into buffers
createBuffers :: WebGLRenderingContext -> Geometry -> IO (GLsizei, WebGLBuffer, Maybe WebGLBuffer)
createBuffers gl Geometry { coords = pts, colors = cls, indices = mids } = do
    -- allocate host buffer for coordinates and colors
    barr <- newIOArrayBuffer (size * 16)
    packVertColors pts cls barr
    -- create and bind device buffer
    buf <- createBuffer gl
    bindBuffer gl gl_ARRAY_BUFFER buf
    -- send data to device
    bufferData gl gl_ARRAY_BUFFER barr gl_STATIC_DRAW
    -- the same for indices
    case mids of
        Nothing -> return (fromIntegral size, buf, Nothing)
        Just ids -> do
            ibuf <- createBuffer gl
            bindBuffer gl gl_ELEMENT_ARRAY_BUFFER ibuf
            bufferData gl gl_ELEMENT_ARRAY_BUFFER (arrayBuffer $ fromList ids) gl_STATIC_DRAW
            return (fromIntegral $ length ids, buf, Just ibuf)
        where size = length pts

-- | Draw our tiny geometry
drawBuffers :: WebGLRenderingContext -> (GLuint, GLuint) -> (GLsizei, WebGLBuffer, Maybe WebGLBuffer) -> IO ()
drawBuffers gl (posLoc, colLoc) (size,buf,mibuf) = do
    -- bind packed buffer with interleaved array inside
    bindBuffer gl gl_ARRAY_BUFFER buf
    vertexAttribPointer gl posLoc 3 gl_FLOAT False 16 0
    vertexAttribPointer gl colLoc 4 gl_UNSIGNED_BYTE True 16 12
    -- bind indices if needed and draw everything
    case mibuf of
        Nothing -> drawArrays gl gl_TRIANGLES 0 size
        Just ibuf -> do
            bindBuffer gl gl_ELEMENT_ARRAY_BUFFER ibuf
            drawElements gl gl_TRIANGLES size gl_UNSIGNED_SHORT 0

fragmentShaderText :: JSString
fragmentShaderText = unlines [
  "precision mediump float;",
  "varying vec4 vColor;",
  "void main(void) {",
  "    gl_FragColor = vColor;",
  "}"]

vertexShaderText :: JSString
vertexShaderText = unlines [
  "attribute vec3 aVertexPosition;",
  "attribute vec4 aVertexColor;",
  "uniform mat4 uPMV;",
  "varying vec4 vColor;",
  "void main(void) {",
  "  gl_Position = uPMV * vec4(aVertexPosition, 1.0);",
  "  vColor = aVertexColor;",
  "}"]

foreign import javascript safe "var ca = document.createElement('canvas'); ca.width = $1; ca.height = $2; document.body.appendChild(ca); $r = ca;"
    addCanvasToBody :: Int -> Int -> IO WebGLCanvas
