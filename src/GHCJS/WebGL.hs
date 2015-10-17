-----------------------------------------------------------------------------
-- |
-- Module      :  GHCJS.WebGL
-- Copyright   :  Copyright (C) 2015 Artem M. Chirkin <chirkin@arch.ethz.ch>
-- License     :  BSD3
--
-- Maintainer  :  Artem M. Chirkin <chirkin@arch.ethz.ch>
-- Stability   :  Experimental
--
-- This module reexports functionality of the three modules in the package.
-- Contains all functions, constants and types available in WebGL 1.0.3 spec.
-- https://www.khronos.org/registry/webgl/specs/1.0.3/
--
-----------------------------------------------------------------------------

module GHCJS.WebGL
    ( module GHCJS.WebGL.Types
    , module GHCJS.WebGL.Const
    , module GHCJS.WebGL.Raw
    ) where

import GHCJS.WebGL.Types
import GHCJS.WebGL.Const
import GHCJS.WebGL.Raw
