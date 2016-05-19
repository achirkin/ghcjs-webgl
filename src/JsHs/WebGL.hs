-----------------------------------------------------------------------------
-- |
-- Module      :  GHCJS.WebGL
-- Copyright   :  Copyright (C) 2015 Artem M. Chirkin <chirkin@arch.ethz.ch>
-- License     :  MIT
--
-- Maintainer  :  Artem M. Chirkin <chirkin@arch.ethz.ch>
-- Stability   :  Experimental
--
-- This module reexports functionality of the three modules in the package.
-- Contains all functions, constants and types available in WebGL 1.0.3 spec.
-- https://www.khronos.org/registry/webgl/specs/1.0.3/
--
-----------------------------------------------------------------------------

module JsHs.WebGL
    ( module JsHs.WebGL.Types
    , module JsHs.WebGL.Const
    , module JsHs.WebGL.Raw
    ) where

import JsHs.WebGL.Types
import JsHs.WebGL.Const
import JsHs.WebGL.Raw
