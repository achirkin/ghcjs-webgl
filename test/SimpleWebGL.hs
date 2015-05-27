module Main where

import Control.Monad (liftM)
import Data.Primitive.ByteArray (MutableByteArray (), newByteArray, writeByteArray)
import Control.Monad.Primitive (PrimState)

import GHCJS.WebGL
import GHCJS.Types
import GHCJS.Foreign


main :: IO ()
main = do
    -- create canvas and get context
    canvas <- createCanvas
    gl <- getCtx canvas
    -- set up viewport
    clearColor gl 0.1 0.2 0.4 (800/400)
    viewport gl 0 0 800 400
    -- init shaders and get attribute locations
    (matLoc, posLoc, colLoc) <- initShaders gl
    -- supply shader with uniform matrix
    matArr <- newTypedArray 16
    fillTypedArray matArr [1, 0, 0, 0
                          ,0, 1, 0, 0
                          ,0, 0, 1, 0
                          ,0, 0, 0, 1]
    uniformMatrix4fv gl matLoc False matArr
    -- create objects (including sending data to device)
    trigbuf <- createBuffers gl triangle
    rectbuf <- createBuffers gl rectangle
    -- clear viewport
    clear gl gl_COLOR_BUFFER_BIT
    -- draw objects
    drawBuffers gl (posLoc,colLoc) trigbuf
    drawBuffers gl (posLoc,colLoc) rectbuf


-- | small JS helper to create a canvas element
foreign import javascript unsafe "document.body.innerHTML = '<canvas id=\"glcanvas\" width=\"800\" height=\"400\"></canvas>'; $r = document.getElementById(\"glcanvas\");"
	createCanvas :: IO (JSRef a)

-- | initialize shader program and get attribute and uniform locations
initShaders :: Ctx -> IO (UniformLocation, GLuint, GLuint)
initShaders gl = do
    -- create program
    shaderProgram <- createProgram gl
    -- attach all shaders
    getShader gl gl_VERTEX_SHADER vertexShaderText >>= attachShader gl shaderProgram
    getShader gl gl_FRAGMENT_SHADER fragmentShaderText >>= attachShader gl shaderProgram
    -- link program
    linkProgram gl shaderProgram
    -- get attribute locations (getAttribLocation returns GLint, but we use always GLuint)
    posLoc <- liftM fromIntegral $ getAttribLocation gl shaderProgram (toJSString "aVertexPosition")
    colorLoc <- liftM fromIntegral $ getAttribLocation gl shaderProgram (toJSString "aVertexColor")
    -- get uniform locations
    matLoc <- getUniformLocation gl shaderProgram (toJSString "uPMV")
    -- activate shader program
    useProgram gl shaderProgram
    -- enable attributes in shaders
    enableVertexAttribArray gl posLoc
    enableVertexAttribArray gl colorLoc
    return (matLoc, posLoc, colorLoc)


-- | Helper function to load shader: create, feed source code, and compile shader
getShader :: Ctx -> GLenum -> String-> IO Shader
getShader gl t src = do
    shaderId <- createShader gl t
    shaderSource gl shaderId (toJSString src)
    compileShader gl shaderId
    return shaderId


-- | Pack points and colors tightly in one buffer:
--   3 floats of 4 bytes each for positions,
--   4 unsigned bytes for colors (aplha is 255)
packVertColors :: [GLfloat] -> [GLubyte]
               -> MutableByteArray (PrimState IO) -> IO ()
packVertColors pnts cls p = f pnts cls 0
    where f (x:y:z:ps) (r:g:b:cs) i = do
            writeByteArray p (4*i) x
            writeByteArray p (4*i+1) y
            writeByteArray p (4*i+2) z
            writeByteArray p (16*i+12) r
            writeByteArray p (16*i+13) g
            writeByteArray p (16*i+14) b
            writeByteArray p (16*i+15) (255 :: GLubyte)
            f ps cs (i+1)
          f _ _ _ = return ()

--foreign import javascript safe "console.log($1)"
--    printRef :: JSRef a -> IO ()

-- | test Geometry
data Geometry = Geometry {
    coords ::  [GLfloat],
    colors ::  [GLubyte],
    indices :: Maybe [GLushort]
    }

-- | Pack geometry data into buffers
createBuffers :: Ctx -> Geometry -> IO (GLsizei, Buffer, Maybe Buffer)
createBuffers gl Geometry { coords = pts, colors = cls, indices = mids } = do
    -- allocate host buffer for coordinates and colors
    barr <- newByteArray (size * 16)
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
            ibarr <- newArrayBuffer ids
            ibuf <- createBuffer gl
            bindBuffer gl gl_ELEMENT_ARRAY_BUFFER ibuf
            bufferData gl gl_ELEMENT_ARRAY_BUFFER ibarr gl_STATIC_DRAW
            return $ (fromIntegral $ length ids, buf, Just ibuf)
        where size = length pts `div` 3

-- | Draw our tiny geometry
drawBuffers :: Ctx -> (GLuint, GLuint) -> (GLsizei, Buffer, Maybe Buffer) -> IO ()
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


rectangle :: Geometry
rectangle = Geometry {
    coords = [0.05,   0.9 , 0
             ,0.95,   0.9 , 0
             ,0.95, (-0.9), 0
             ,0.05, (-0.9), 0],
    colors = [255, 0, 0
             ,0, 255, 0
             ,0,   0, 255
             ,0, 127, 127],
    indices = Just [0,1,2,0,2,3]
    }

triangle :: Geometry
triangle = Geometry {
    coords = [(-0.95), (-0.8), 0
             ,(-0.50),   0.8 , 0
             ,(-0.05), (-0.8), 0],
    colors = [255, 0, 0
             ,0, 255, 0
             ,0, 0, 255],
    indices = Nothing
    }


fragmentShaderText :: String
fragmentShaderText = unlines [
  "precision mediump float;",
  "varying vec4 vColor;",
  "void main(void) {",
  "    gl_FragColor = vColor;",
  "}"]

vertexShaderText :: String
vertexShaderText = unlines [
  "attribute vec3 aVertexPosition;",
  "attribute vec4 aVertexColor;",
  "uniform mat4 uPMV;",
  "varying vec4 vColor;",
  "void main(void) {",
  "  gl_Position = uPMV * vec4(aVertexPosition, 1.0);",
  "  vColor = aVertexColor;",
  "}"]
