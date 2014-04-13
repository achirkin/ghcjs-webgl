module Main where

import GHCJS.Foreign
import GHCJS.Types

import Javascript.WebGL

foreign import javascript unsafe "document.getElementById($1)"
	elemById :: JSString -> IO (JSRef a)

main :: IO ()
main = do
	canvas <- elemById . toJSString $ "main"
	ctx <- getCtx canvas
	clearColor ctx 1 0 0 1
	clear ctx gl_COLOR_BUFFER_BIT



