module Main where

import Control.Concurrent

import GHCJS.Foreign
import GHCJS.Marshal
import GHCJS.Types

import Javascript.WebGL

foreign import javascript unsafe "document.getElementById($1)"
	elemById :: JSString -> IO (JSRef a)

main :: IO ()
main = do
	canvas <- elemById . toJSString $ "main"
	ctx <- getCtx canvas

	program <- createProgram ctx
	vs <- createShader ctx gl_VERTEX_SHADER
	fs <- createShader ctx gl_FRAGMENT_SHADER

	shaderSource ctx vs vsSource
	shaderSource ctx fs fsSource
	compileShader ctx vs
	compileShader ctx fs
	attachShader ctx program vs
	attachShader ctx program fs
	bindAttribLocation ctx program 0 $ toJSString "pos"

	linkProgram ctx program
	useProgram ctx program
	loc <- getUniformLocation ctx program $ toJSString "time"

	clearColor ctx 0 0 0 1
	viewport ctx 0 0 640 640
	--enable ctx gl_DEPTH_TEST

	buffer <- createBuffer ctx
	vertArray <- vertList >>= toArray >>= float32View
	bindBuffer ctx gl_ARRAY_BUFFER buffer
	bufferData ctx gl_ARRAY_BUFFER vertArray gl_STATIC_DRAW
	enableVertexAttribArray ctx 0
	vertexAttribPointer ctx 0 2 gl_FLOAT False 0 0

	loop 0 $ \t -> threadDelay 30 >> draw ctx buffer loc t >> return (t + 30 / 1000)

	where loop x a = a x >>= flip loop a

vertList :: IO ([JSRef Float])
vertList = mapM toJSRef $
	[ -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5 ]

draw :: Ctx -> Buffer -> UniformLocation -> Float -> IO ()
draw ctx buffer tu t = do
	clear ctx gl_COLOR_BUFFER_BIT
	bindBuffer ctx gl_ARRAY_BUFFER buffer
	uniform1f ctx tu t
	drawArrays ctx gl_TRIANGLE_FAN 0 4

vsSource :: JSString
vsSource = toJSString $ "uniform float time;attribute vec2 pos;varying vec3 col;void main(){gl_Position=vec4(pos,0.0,1.0);col=vec3(pos.x + 0.5, pos.y + 0.5, mod(time / 5.0, 1.0));}"

fsSource :: JSString
fsSource = toJSString $ "precision mediump float;varying vec3 col;void main(){gl_FragColor=vec4(col,1.0);}"
