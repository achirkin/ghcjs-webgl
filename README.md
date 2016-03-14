# ghcjs-webgl

Minimalistic, yet (hopefully) fully functional WebGL binding.
All functions are in one-to-one correspondence.
Thanks to user ziocroc for the initial version of the library.

### Examples

Tiny code example is available in `test/SimpleWebGL.hs` file.
Within less than 200 rows it draws a rectangle and a triangle,
shows how to work with shaders (compile, pass uniforms and attributes),
pack interleaved arrays, and draw buffers (directly or indiced).


### A note on ArrayBuffers

ArrayBuffers from JS correspond to primitive MutableByteArray in HS (that is how GHCJS works).
Thus, in Haskell code, use MutableByteArrays to fiddle with binary data.
Couple wrappers are written to work with TypedArrays naturally
(they are a type family within a type class).
I moved these wrappers into ghcjs-base-alt,
 which is a small deviation from ghcjs-base that has different TypedArray implementation.

