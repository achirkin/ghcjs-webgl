# ghcjs-webgl

Minimalistic, yet (hopefully) fully functional WebGL binding.
All functions are in one-to-one correspondence.
Thanks to user ziocroc for the initial version of the library.

### Examples

Tiny code example is available in `test/SimpleWebGL.hs` file.
Within less than 200 rows it draws a rectangle and a triangle,
shows how to work with shaders (compile, pass uniforms and attributes),
pack interleaved arrays, and draw buffers (directly or indiced).


### Dependencies:

source-repository head
  type:     git
  location: https://github.com/achirkin/qua-kit
  subdir:   libs/hs/ghcjs-hs-interop
