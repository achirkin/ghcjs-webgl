if(typeof require !== 'undefined') {
  var h$nodeFs = require('fs');
}
var goog = {};
goog.global = this;
goog.global.goog = goog;
goog.global.CLOSURE_NO_DEPS = true;
if(this['print'] !== undefined && this['console'] === undefined) {
  this['console'] = { log: this['print'] };
}
if(this['navigator'] === undefined) {
  navigator = { appName: 'none' };
}
if (!Date.now) {
  Date.now = function now() {
    return +(new Date);
  };
}

(function (global) {
  "use strict";
  var USE_NATIVE_IF_AVAILABLE = true;
  var ECMAScript = (function () {
    var opts = Object.prototype.toString,
        ophop = Object.prototype.hasOwnProperty;
    return {
      Class: function(v) { return opts.call(v).replace(/^\[object *|\]$/g, ''); },
      HasProperty: function(o, p) { return p in o; },
      HasOwnProperty: function(o, p) { return ophop.call(o, p); },
      IsCallable: function(o) { return typeof o === 'function'; },
      ToInt32: function (v) { return v >> 0; },
      ToUint32: function (v) { return v >>> 0; }
    };
  }());
  function new_INDEX_SIZE_ERR() {
    try {
      if (document) {
        document.createTextNode("").splitText(1);
      }
      return new RangeError("INDEX_SIZE_ERR");
    } catch (e) {
      return e;
    }
  }
  function configureProperties(obj) {
    if (Object.getOwnPropertyNames && Object.defineProperty) {
      var props = Object.getOwnPropertyNames(obj), i;
      for (i = 0; i < props.length; i += 1) {
        Object.defineProperty(obj, props[i], {
          value: obj[props[i]],
          writable: false,
          enumerable: false,
          configurable: false
        });
      }
    }
  }
  if (!Object.defineProperty ||
       !(function () { try { Object.defineProperty({}, 'x', {}); return true; } catch (e) { return false; } } ())) {
    Object.defineProperty = function (o, p, desc) {
      if (!o === Object(o)) { throw new TypeError("Object.defineProperty called on non-object"); }
      if (ECMAScript.HasProperty(desc, 'get') && Object.prototype.__defineGetter__) { Object.prototype.__defineGetter__.call(o, p, desc.get); }
      if (ECMAScript.HasProperty(desc, 'set') && Object.prototype.__defineSetter__) { Object.prototype.__defineSetter__.call(o, p, desc.set); }
      if (ECMAScript.HasProperty(desc, 'value')) { o[p] = desc.value; }
      return o;
    };
  }
  if (!Object.getOwnPropertyNames) {
    Object.getOwnPropertyNames = function getOwnPropertyNames(o) {
      if (o !== Object(o)) { throw new TypeError("Object.getOwnPropertyNames called on non-object"); }
      var props = [], p;
      for (p in o) {
        if (ECMAScript.HasOwnProperty(o, p)) {
          props.push(p);
        }
      }
      return props;
    };
  }
  function makeArrayAccessors(obj) {
    if (!Object.defineProperty) { return; }
    function makeArrayAccessor(index) {
      Object.defineProperty(obj, index, {
        'get': function () { return obj._getter(index); },
        'set': function (v) { obj._setter(index, v); },
        enumerable: true,
        configurable: false
      });
    }
    var i;
    for (i = 0; i < obj.length; i += 1) {
      makeArrayAccessor(i);
    }
  }
  function as_signed(value, bits) { var s = 32 - bits; return (value << s) >> s; }
  function as_unsigned(value, bits) { var s = 32 - bits; return (value << s) >>> s; }
  function packInt8(n) { return [n & 0xff]; }
  function unpackInt8(bytes) { return as_signed(bytes[0], 8); }
  function packUint8(n) { return [n & 0xff]; }
  function unpackUint8(bytes) { return as_unsigned(bytes[0], 8); }
  function packUint8Clamped(n) { n = Math.round(Number(n)); return [n < 0 ? 0 : n > 0xff ? 0xff : n & 0xff]; }
  function packInt16(n) { return [(n >> 8) & 0xff, n & 0xff]; }
  function unpackInt16(bytes) { return as_signed(bytes[0] << 8 | bytes[1], 16); }
  function packUint16(n) { return [(n >> 8) & 0xff, n & 0xff]; }
  function unpackUint16(bytes) { return as_unsigned(bytes[0] << 8 | bytes[1], 16); }
  function packInt32(n) { return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]; }
  function unpackInt32(bytes) { return as_signed(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32); }
  function packUint32(n) { return [(n >> 24) & 0xff, (n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]; }
  function unpackUint32(bytes) { return as_unsigned(bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], 32); }
  function packIEEE754(v, ebits, fbits) {
    var bias = (1 << (ebits - 1)) - 1,
        s, e, f, ln,
        i, bits, str, bytes;
    if (v !== v) {
      e = (1 << bias) - 1; f = Math.pow(2, fbits - 1); s = 0;
    } else if (v === Infinity || v === -Infinity) {
      e = (1 << bias) - 1; f = 0; s = (v < 0) ? 1 : 0;
    } else if (v === 0) {
      e = 0; f = 0; s = (1 / v === -Infinity) ? 1 : 0;
    } else {
      s = v < 0;
      v = Math.abs(v);
      if (v >= Math.pow(2, 1 - bias)) {
        ln = Math.min(Math.floor(Math.log(v) / Math.LN2), bias);
        e = ln + bias;
        f = Math.round(v * Math.pow(2, fbits - ln) - Math.pow(2, fbits));
      } else {
        e = 0;
        f = Math.round(v / Math.pow(2, 1 - bias - fbits));
      }
    }
    bits = [];
    for (i = fbits; i; i -= 1) { bits.push(f % 2 ? 1 : 0); f = Math.floor(f / 2); }
    for (i = ebits; i; i -= 1) { bits.push(e % 2 ? 1 : 0); e = Math.floor(e / 2); }
    bits.push(s ? 1 : 0);
    bits.reverse();
    str = bits.join('');
    bytes = [];
    while (str.length) {
      bytes.push(parseInt(str.substring(0, 8), 2));
      str = str.substring(8);
    }
    return bytes;
  }
  function unpackIEEE754(bytes, ebits, fbits) {
    var bits = [], i, j, b, str,
        bias, s, e, f;
    for (i = bytes.length; i; i -= 1) {
      b = bytes[i - 1];
      for (j = 8; j; j -= 1) {
        bits.push(b % 2 ? 1 : 0); b = b >> 1;
      }
    }
    bits.reverse();
    str = bits.join('');
    bias = (1 << (ebits - 1)) - 1;
    s = parseInt(str.substring(0, 1), 2) ? -1 : 1;
    e = parseInt(str.substring(1, 1 + ebits), 2);
    f = parseInt(str.substring(1 + ebits), 2);
    if (e === (1 << ebits) - 1) {
      return f !== 0 ? NaN : s * Infinity;
    } else if (e > 0) {
      return s * Math.pow(2, e - bias) * (1 + f / Math.pow(2, fbits));
    } else if (f !== 0) {
      return s * Math.pow(2, -(bias - 1)) * (f / Math.pow(2, fbits));
    } else {
      return s < 0 ? -0 : 0;
    }
  }
  function unpackFloat64(b) { return unpackIEEE754(b, 11, 52); }
  function packFloat64(v) { return packIEEE754(v, 11, 52); }
  function unpackFloat32(b) { return unpackIEEE754(b, 8, 23); }
  function packFloat32(v) { return packIEEE754(v, 8, 23); }
  (function () {
    var ArrayBuffer = function ArrayBuffer(length) {
      length = ECMAScript.ToInt32(length);
      if (length < 0) { throw new RangeError('ArrayBuffer size is not a small enough positive integer.'); }
      this.byteLength = length;
      this._bytes = [];
      this._bytes.length = length;
      var i;
      for (i = 0; i < this.byteLength; i += 1) {
        this._bytes[i] = 0;
      }
      configureProperties(this);
    };
    var ArrayBufferView = function ArrayBufferView() {
    };
    function makeTypedArrayConstructor(bytesPerElement, pack, unpack) {
      var ctor;
      ctor = function (buffer, byteOffset, length) {
        var array, sequence, i, s;
        if (!arguments.length || typeof arguments[0] === 'number') {
          this.length = ECMAScript.ToInt32(arguments[0]);
          if (length < 0) { throw new RangeError('ArrayBufferView size is not a small enough positive integer.'); }
          this.byteLength = this.length * this.BYTES_PER_ELEMENT;
          this.buffer = new ArrayBuffer(this.byteLength);
          this.byteOffset = 0;
        } else if (typeof arguments[0] === 'object' && arguments[0].constructor === ctor) {
          array = arguments[0];
          this.length = array.length;
          this.byteLength = this.length * this.BYTES_PER_ELEMENT;
          this.buffer = new ArrayBuffer(this.byteLength);
          this.byteOffset = 0;
          for (i = 0; i < this.length; i += 1) {
            this._setter(i, array._getter(i));
          }
        } else if (typeof arguments[0] === 'object' &&
                   !(arguments[0] instanceof ArrayBuffer || ECMAScript.Class(arguments[0]) === 'ArrayBuffer')) {
          sequence = arguments[0];
          this.length = ECMAScript.ToUint32(sequence.length);
          this.byteLength = this.length * this.BYTES_PER_ELEMENT;
          this.buffer = new ArrayBuffer(this.byteLength);
          this.byteOffset = 0;
          for (i = 0; i < this.length; i += 1) {
            s = sequence[i];
            this._setter(i, Number(s));
          }
        } else if (typeof arguments[0] === 'object' &&
                   (arguments[0] instanceof ArrayBuffer || ECMAScript.Class(arguments[0]) === 'ArrayBuffer')) {
          this.buffer = buffer;
          this.byteOffset = ECMAScript.ToUint32(byteOffset);
          if (this.byteOffset > this.buffer.byteLength) {
            throw new_INDEX_SIZE_ERR();
          }
          if (this.byteOffset % this.BYTES_PER_ELEMENT) {
            throw new RangeError("ArrayBuffer length minus the byteOffset is not a multiple of the element size.");
          }
          if (arguments.length < 3) {
            this.byteLength = this.buffer.byteLength - this.byteOffset;
            if (this.byteLength % this.BYTES_PER_ELEMENT) {
              throw new_INDEX_SIZE_ERR();
            }
            this.length = this.byteLength / this.BYTES_PER_ELEMENT;
          } else {
            this.length = ECMAScript.ToUint32(length);
            this.byteLength = this.length * this.BYTES_PER_ELEMENT;
          }
          if ((this.byteOffset + this.byteLength) > this.buffer.byteLength) {
            throw new_INDEX_SIZE_ERR();
          }
        } else {
          throw new TypeError("Unexpected argument type(s)");
        }
        this.constructor = ctor;
        configureProperties(this);
        makeArrayAccessors(this);
      };
      ctor.prototype = new ArrayBufferView();
      ctor.prototype.BYTES_PER_ELEMENT = bytesPerElement;
      ctor.prototype._pack = pack;
      ctor.prototype._unpack = unpack;
      ctor.BYTES_PER_ELEMENT = bytesPerElement;
      ctor.prototype._getter = function (index) {
        if (arguments.length < 1) { throw new SyntaxError("Not enough arguments"); }
        index = ECMAScript.ToUint32(index);
        if (index >= this.length) {
          return (void 0);
        }
        var bytes = [], i, o;
        for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT;
             i < this.BYTES_PER_ELEMENT;
             i += 1, o += 1) {
          bytes.push(this.buffer._bytes[o]);
        }
        return this._unpack(bytes);
      };
      ctor.prototype.get = ctor.prototype._getter;
      ctor.prototype._setter = function (index, value) {
        if (arguments.length < 2) { throw new SyntaxError("Not enough arguments"); }
        index = ECMAScript.ToUint32(index);
        if (index >= this.length) {
          return;
        }
        var bytes = this._pack(value), i, o;
        for (i = 0, o = this.byteOffset + index * this.BYTES_PER_ELEMENT;
             i < this.BYTES_PER_ELEMENT;
             i += 1, o += 1) {
          this.buffer._bytes[o] = bytes[i];
        }
      };
      ctor.prototype.set = function (index, value) {
        if (arguments.length < 1) { throw new SyntaxError("Not enough arguments"); }
        var array, sequence, offset, len,
            i, s, d,
            byteOffset, byteLength, tmp;
        if (typeof arguments[0] === 'object' && arguments[0].constructor === this.constructor) {
          array = arguments[0];
          offset = ECMAScript.ToUint32(arguments[1]);
          if (offset + array.length > this.length) {
            throw new_INDEX_SIZE_ERR();
          }
          byteOffset = this.byteOffset + offset * this.BYTES_PER_ELEMENT;
          byteLength = array.length * this.BYTES_PER_ELEMENT;
          if (array.buffer === this.buffer) {
            tmp = [];
            for (i = 0, s = array.byteOffset; i < byteLength; i += 1, s += 1) {
              tmp[i] = array.buffer._bytes[s];
            }
            for (i = 0, d = byteOffset; i < byteLength; i += 1, d += 1) {
              this.buffer._bytes[d] = tmp[i];
            }
          } else {
            for (i = 0, s = array.byteOffset, d = byteOffset;
                 i < byteLength; i += 1, s += 1, d += 1) {
              this.buffer._bytes[d] = array.buffer._bytes[s];
            }
          }
        } else if (typeof arguments[0] === 'object' && typeof arguments[0].length !== 'undefined') {
          sequence = arguments[0];
          len = ECMAScript.ToUint32(sequence.length);
          offset = ECMAScript.ToUint32(arguments[1]);
          if (offset + len > this.length) {
            throw new_INDEX_SIZE_ERR();
          }
          for (i = 0; i < len; i += 1) {
            s = sequence[i];
            this._setter(offset + i, Number(s));
          }
        } else {
          throw new TypeError("Unexpected argument type(s)");
        }
      };
      ctor.prototype.subarray = function (start, end) {
        function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
        start = ECMAScript.ToInt32(start);
        end = ECMAScript.ToInt32(end);
        if (arguments.length < 1) { start = 0; }
        if (arguments.length < 2) { end = this.length; }
        if (start < 0) { start = this.length + start; }
        if (end < 0) { end = this.length + end; }
        start = clamp(start, 0, this.length);
        end = clamp(end, 0, this.length);
        var len = end - start;
        if (len < 0) {
          len = 0;
        }
        return new this.constructor(
          this.buffer, this.byteOffset + start * this.BYTES_PER_ELEMENT, len);
      };
      return ctor;
    }
    var Int8Array = makeTypedArrayConstructor(1, packInt8, unpackInt8);
    var Uint8Array = makeTypedArrayConstructor(1, packUint8, unpackUint8);
    var Uint8ClampedArray = makeTypedArrayConstructor(1, packUint8Clamped, unpackUint8);
    var Int16Array = makeTypedArrayConstructor(2, packInt16, unpackInt16);
    var Uint16Array = makeTypedArrayConstructor(2, packUint16, unpackUint16);
    var Int32Array = makeTypedArrayConstructor(4, packInt32, unpackInt32);
    var Uint32Array = makeTypedArrayConstructor(4, packUint32, unpackUint32);
    var Float32Array = makeTypedArrayConstructor(4, packFloat32, unpackFloat32);
    var Float64Array = makeTypedArrayConstructor(8, packFloat64, unpackFloat64);
    if (USE_NATIVE_IF_AVAILABLE) {
      global.ArrayBuffer = global.ArrayBuffer || ArrayBuffer;
      global.Int8Array = global.Int8Array || Int8Array;
      global.Uint8Array = global.Uint8Array || Uint8Array;
      global.Uint8ClampedArray = global.Uint8ClampedArray || Uint8ClampedArray;
      global.Int16Array = global.Int16Array || Int16Array;
      global.Uint16Array = global.Uint16Array || Uint16Array;
      global.Int32Array = global.Int32Array || Int32Array;
      global.Uint32Array = global.Uint32Array || Uint32Array;
      global.Float32Array = global.Float32Array || Float32Array;
      global.Float64Array = global.Float64Array || Float64Array;
    } else {
      global.ArrayBuffer = ArrayBuffer;
      global.Int8Array = Int8Array;
      global.Uint8Array = Uint8Array;
      global.Uint8ClampedArray = Uint8ClampedArray;
      global.Int16Array = Int16Array;
      global.Uint16Array = Uint16Array;
      global.Int32Array = Int32Array;
      global.Uint32Array = Uint32Array;
      global.Float32Array = Float32Array;
      global.Float64Array = Float64Array;
    }
  } ());
  (function () {
    function r(array, index) {
      return ECMAScript.IsCallable(array.get) ? array.get(index) : array[index];
    }
    var IS_BIG_ENDIAN = (function () {
      var u16array = new Uint16Array([0x1234]),
          u8array = new Uint8Array(u16array.buffer);
      return r(u8array, 0) === 0x12;
    } ());
    var DataView = function DataView(buffer, byteOffset, byteLength) {
      if (arguments.length === 0) {
        buffer = new ArrayBuffer(0);
      } else if (!(buffer instanceof ArrayBuffer || ECMAScript.Class(buffer) === 'ArrayBuffer')) {
        throw new TypeError("TypeError");
      }
      this.buffer = buffer || new ArrayBuffer(0);
      this.byteOffset = ECMAScript.ToUint32(byteOffset);
      if (this.byteOffset > this.buffer.byteLength) {
        throw new_INDEX_SIZE_ERR();
      }
      if (arguments.length < 3) {
        this.byteLength = this.buffer.byteLength - this.byteOffset;
      } else {
        this.byteLength = ECMAScript.ToUint32(byteLength);
      }
      if ((this.byteOffset + this.byteLength) > this.buffer.byteLength) {
        throw new_INDEX_SIZE_ERR();
      }
      configureProperties(this);
    };
    function makeDataView_getter(arrayType) {
      return function (byteOffset, littleEndian) {
        byteOffset = ECMAScript.ToUint32(byteOffset);
        if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
          throw new_INDEX_SIZE_ERR();
        }
        byteOffset += this.byteOffset;
        var uint8Array = new Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT),
            bytes = [], i;
        for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
          bytes.push(r(uint8Array, i));
        }
        if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
          bytes.reverse();
        }
        return r(new arrayType(new Uint8Array(bytes).buffer), 0);
      };
    }
    DataView.prototype.getUint8 = makeDataView_getter(Uint8Array);
    DataView.prototype.getInt8 = makeDataView_getter(Int8Array);
    DataView.prototype.getUint16 = makeDataView_getter(Uint16Array);
    DataView.prototype.getInt16 = makeDataView_getter(Int16Array);
    DataView.prototype.getUint32 = makeDataView_getter(Uint32Array);
    DataView.prototype.getInt32 = makeDataView_getter(Int32Array);
    DataView.prototype.getFloat32 = makeDataView_getter(Float32Array);
    DataView.prototype.getFloat64 = makeDataView_getter(Float64Array);
    function makeDataView_setter(arrayType) {
      return function (byteOffset, value, littleEndian) {
        byteOffset = ECMAScript.ToUint32(byteOffset);
        if (byteOffset + arrayType.BYTES_PER_ELEMENT > this.byteLength) {
          throw new_INDEX_SIZE_ERR();
        }
        var typeArray = new arrayType([value]),
            byteArray = new Uint8Array(typeArray.buffer),
            bytes = [], i, byteView;
        for (i = 0; i < arrayType.BYTES_PER_ELEMENT; i += 1) {
          bytes.push(r(byteArray, i));
        }
        if (Boolean(littleEndian) === Boolean(IS_BIG_ENDIAN)) {
          bytes.reverse();
        }
        byteView = new Uint8Array(this.buffer, byteOffset, arrayType.BYTES_PER_ELEMENT);
        byteView.set(bytes);
      };
    }
    DataView.prototype.setUint8 = makeDataView_setter(Uint8Array);
    DataView.prototype.setInt8 = makeDataView_setter(Int8Array);
    DataView.prototype.setUint16 = makeDataView_setter(Uint16Array);
    DataView.prototype.setInt16 = makeDataView_setter(Int16Array);
    DataView.prototype.setUint32 = makeDataView_setter(Uint32Array);
    DataView.prototype.setInt32 = makeDataView_setter(Int32Array);
    DataView.prototype.setFloat32 = makeDataView_setter(Float32Array);
    DataView.prototype.setFloat64 = makeDataView_setter(Float64Array);
    if (USE_NATIVE_IF_AVAILABLE) {
      global.DataView = global.DataView || DataView;
    } else {
      global.DataView = DataView;
    }
  } ());
} (this));

if(typeof exports !== 'undefined') {
  if(typeof WeakMap === 'undefined') {
    WeakMap = exports.WeakMap;
  }
}

var COMPILED = false;
var goog = goog || {};
goog.global = this;
goog.DEBUG = true;
goog.LOCALE = 'en';
goog.provide = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      throw Error('Namespace "' + name + '" already declared.');
    }
    delete goog.implicitNamespaces_[name];
    var namespace = name;
    while ((namespace = namespace.substring(0, namespace.lastIndexOf('.')))) {
      if (goog.getObjectByName(namespace)) {
        break;
      }
      goog.implicitNamespaces_[namespace] = true;
    }
  }
  goog.exportPath_(name);
};
goog.setTestOnly = function(opt_message) {
  if (COMPILED && !goog.DEBUG) {
    opt_message = opt_message || '';
    throw Error('Importing test-only code into non-debug environment' +
                opt_message ? ': ' + opt_message : '.');
  }
};
if (!COMPILED) {
  goog.isProvided_ = function(name) {
    return !goog.implicitNamespaces_[name] && !!goog.getObjectByName(name);
  };
  goog.implicitNamespaces_ = {};
}
goog.exportPath_ = function(name, opt_object, opt_objectToExportTo) {
  var parts = name.split('.');
  var cur = opt_objectToExportTo || goog.global;
  if (!(parts[0] in cur) && cur.execScript) {
    cur.execScript('var ' + parts[0]);
  }
  for (var part; parts.length && (part = parts.shift());) {
    if (!parts.length && goog.isDef(opt_object)) {
      cur[part] = opt_object;
    } else if (cur[part]) {
      cur = cur[part];
    } else {
      cur = cur[part] = {};
    }
  }
};
goog.getObjectByName = function(name, opt_obj) {
  var parts = name.split('.');
  var cur = opt_obj || goog.global;
  for (var part; part = parts.shift(); ) {
    if (goog.isDefAndNotNull(cur[part])) {
      cur = cur[part];
    } else {
      return null;
    }
  }
  return cur;
};
goog.globalize = function(obj, opt_global) {
  var global = opt_global || goog.global;
  for (var x in obj) {
    global[x] = obj[x];
  }
};
goog.addDependency = function(relPath, provides, requires) {
  if (!COMPILED) {
    var provide, require;
    var path = relPath.replace(/\\/g, '/');
    var deps = goog.dependencies_;
    for (var i = 0; provide = provides[i]; i++) {
      deps.nameToPath[provide] = path;
      if (!(path in deps.pathToNames)) {
        deps.pathToNames[path] = {};
      }
      deps.pathToNames[path][provide] = true;
    }
    for (var j = 0; require = requires[j]; j++) {
      if (!(path in deps.requires)) {
        deps.requires[path] = {};
      }
      deps.requires[path][require] = true;
    }
  }
};
goog.ENABLE_DEBUG_LOADER = true;
goog.require = function(name) {
  if (!COMPILED) {
    if (goog.isProvided_(name)) {
      return;
    }
    if (goog.ENABLE_DEBUG_LOADER) {
      var path = goog.getPathFromDeps_(name);
      if (path) {
        goog.included_[path] = true;
        goog.writeScripts_();
        return;
      }
    }
    var errorMessage = 'goog.require could not find: ' + name;
    if (goog.global.console) {
      goog.global.console['error'](errorMessage);
    }
      throw Error(errorMessage);
  }
};
goog.basePath = '';
goog.global.CLOSURE_BASE_PATH;
goog.global.CLOSURE_NO_DEPS;
goog.global.CLOSURE_IMPORT_SCRIPT;
goog.nullFunction = function() {};
goog.identityFunction = function(opt_returnValue, var_args) {
  return opt_returnValue;
};
goog.abstractMethod = function() {
  throw Error('unimplemented abstract method');
};
goog.addSingletonGetter = function(ctor) {
  ctor.getInstance = function() {
    if (ctor.instance_) {
      return ctor.instance_;
    }
    if (goog.DEBUG) {
      goog.instantiatedSingletons_[goog.instantiatedSingletons_.length] = ctor;
    }
    return ctor.instance_ = new ctor;
  };
};
goog.instantiatedSingletons_ = [];
if (!COMPILED && goog.ENABLE_DEBUG_LOADER) {
  goog.included_ = {};
  goog.dependencies_ = {
    pathToNames: {},
    nameToPath: {},
    requires: {},
    visited: {},
    written: {}
  };
  goog.inHtmlDocument_ = function() {
    var doc = goog.global.document;
    return typeof doc != 'undefined' &&
           'write' in doc;
  };
  goog.findBasePath_ = function() {
    if (goog.global.CLOSURE_BASE_PATH) {
      goog.basePath = goog.global.CLOSURE_BASE_PATH;
      return;
    } else if (!goog.inHtmlDocument_()) {
      return;
    }
    var doc = goog.global.document;
    var scripts = doc.getElementsByTagName('script');
    for (var i = scripts.length - 1; i >= 0; --i) {
      var src = scripts[i].src;
      var qmark = src.lastIndexOf('?');
      var l = qmark == -1 ? src.length : qmark;
      if (src.substr(l - 7, 7) == 'base.js') {
        goog.basePath = src.substr(0, l - 7);
        return;
      }
    }
  };
  goog.importScript_ = function(src) {
    var importScript = goog.global.CLOSURE_IMPORT_SCRIPT ||
        goog.writeScriptTag_;
    if (!goog.dependencies_.written[src] && importScript(src)) {
      goog.dependencies_.written[src] = true;
    }
  };
  goog.writeScriptTag_ = function(src) {
    if (goog.inHtmlDocument_()) {
      var doc = goog.global.document;
      if (doc.readyState == 'complete') {
        var isDeps = /\bdeps.js$/.test(src);
        if (isDeps) {
          return false;
        } else {
          throw Error('Cannot write "' + src + '" after document load');
        }
      }
      doc.write(
          '<script type="text/javascript" src="' + src + '"></' + 'script>');
      return true;
    } else {
      return false;
    }
  };
  goog.writeScripts_ = function() {
    var scripts = [];
    var seenScript = {};
    var deps = goog.dependencies_;
    function visitNode(path) {
      if (path in deps.written) {
        return;
      }
      if (path in deps.visited) {
        if (!(path in seenScript)) {
          seenScript[path] = true;
          scripts.push(path);
        }
        return;
      }
      deps.visited[path] = true;
      if (path in deps.requires) {
        for (var requireName in deps.requires[path]) {
          if (!goog.isProvided_(requireName)) {
            if (requireName in deps.nameToPath) {
              visitNode(deps.nameToPath[requireName]);
            } else {
              throw Error('Undefined nameToPath for ' + requireName);
            }
          }
        }
      }
      if (!(path in seenScript)) {
        seenScript[path] = true;
        scripts.push(path);
      }
    }
    for (var path in goog.included_) {
      if (!deps.written[path]) {
        visitNode(path);
      }
    }
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i]) {
        goog.importScript_(goog.basePath + scripts[i]);
      } else {
        throw Error('Undefined script input');
      }
    }
  };
  goog.getPathFromDeps_ = function(rule) {
    if (rule in goog.dependencies_.nameToPath) {
      return goog.dependencies_.nameToPath[rule];
    } else {
      return null;
    }
  };
  goog.findBasePath_();
  if (!goog.global.CLOSURE_NO_DEPS) {
    goog.importScript_(goog.basePath + 'deps.js');
  }
}
goog.typeOf = function(value) {
  var s = typeof value;
  if (s == 'object') {
    if (value) {
      if (value instanceof Array) {
        return 'array';
      } else if (value instanceof Object) {
        return s;
      }
      var className = Object.prototype.toString.call(
                                (value));
      if (className == '[object Window]') {
        return 'object';
      }
      if ((className == '[object Array]' ||
           typeof value.length == 'number' &&
           typeof value.splice != 'undefined' &&
           typeof value.propertyIsEnumerable != 'undefined' &&
           !value.propertyIsEnumerable('splice')
          )) {
        return 'array';
      }
      if ((className == '[object Function]' ||
          typeof value.call != 'undefined' &&
          typeof value.propertyIsEnumerable != 'undefined' &&
          !value.propertyIsEnumerable('call'))) {
        return 'function';
      }
    } else {
      return 'null';
    }
  } else if (s == 'function' && typeof value.call == 'undefined') {
    return 'object';
  }
  return s;
};
goog.isDef = function(val) {
  return val !== undefined;
};
goog.isNull = function(val) {
  return val === null;
};
goog.isDefAndNotNull = function(val) {
  return val != null;
};
goog.isArray = function(val) {
  return goog.typeOf(val) == 'array';
};
goog.isArrayLike = function(val) {
  var type = goog.typeOf(val);
  return type == 'array' || type == 'object' && typeof val.length == 'number';
};
goog.isDateLike = function(val) {
  return goog.isObject(val) && typeof val.getFullYear == 'function';
};
goog.isString = function(val) {
  return typeof val == 'string';
};
goog.isBoolean = function(val) {
  return typeof val == 'boolean';
};
goog.isNumber = function(val) {
  return typeof val == 'number';
};
goog.isFunction = function(val) {
  return goog.typeOf(val) == 'function';
};
goog.isObject = function(val) {
  var type = typeof val;
  return type == 'object' && val != null || type == 'function';
};
goog.getUid = function(obj) {
  return obj[goog.UID_PROPERTY_] ||
      (obj[goog.UID_PROPERTY_] = ++goog.uidCounter_);
};
goog.removeUid = function(obj) {
  if ('removeAttribute' in obj) {
    obj.removeAttribute(goog.UID_PROPERTY_);
  }
  try {
    delete obj[goog.UID_PROPERTY_];
  } catch (ex) {
  }
};
goog.UID_PROPERTY_ = 'closure_uid_' +
    Math.floor(Math.random() * 2147483648).toString(36);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.cloneObject = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.cloneObject(obj[key]);
    }
    return clone;
  }
  return obj;
};
goog.bindNative_ = function(fn, selfObj, var_args) {
  return (fn.call.apply(fn.bind, arguments));
};
goog.bindJs_ = function(fn, selfObj, var_args) {
  if (!fn) {
    throw new Error();
  }
  if (arguments.length > 2) {
    var boundArgs = Array.prototype.slice.call(arguments, 2);
    return function() {
      var newArgs = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(newArgs, boundArgs);
      return fn.apply(selfObj, newArgs);
    };
  } else {
    return function() {
      return fn.apply(selfObj, arguments);
    };
  }
};
goog.bind = function(fn, selfObj, var_args) {
  if (Function.prototype.bind &&
      Function.prototype.bind.toString().indexOf('native code') != -1) {
    goog.bind = goog.bindNative_;
  } else {
    goog.bind = goog.bindJs_;
  }
  return goog.bind.apply(null, arguments);
};
goog.partial = function(fn, var_args) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var newArgs = Array.prototype.slice.call(arguments);
    newArgs.unshift.apply(newArgs, args);
    return fn.apply(this, newArgs);
  };
};
goog.mixin = function(target, source) {
  for (var x in source) {
    target[x] = source[x];
  }
};
goog.now = Date.now || (function() {
  return +new Date();
});
goog.globalEval = function(script) {
  if (goog.global.execScript) {
    goog.global.execScript(script, 'JavaScript');
  } else if (goog.global.eval) {
    if (goog.evalWorksForGlobals_ == null) {
      goog.global.eval('var _et_ = 1;');
      if (typeof goog.global['_et_'] != 'undefined') {
        delete goog.global['_et_'];
        goog.evalWorksForGlobals_ = true;
      } else {
        goog.evalWorksForGlobals_ = false;
      }
    }
    if (goog.evalWorksForGlobals_) {
      goog.global.eval(script);
    } else {
      var doc = goog.global.document;
      var scriptElt = doc.createElement('script');
      scriptElt.type = 'text/javascript';
      scriptElt.defer = false;
      scriptElt.appendChild(doc.createTextNode(script));
      doc.body.appendChild(scriptElt);
      doc.body.removeChild(scriptElt);
    }
  } else {
    throw Error('goog.globalEval not available');
  }
};
goog.evalWorksForGlobals_ = null;
goog.cssNameMapping_;
goog.cssNameMappingStyle_;
goog.getCssName = function(className, opt_modifier) {
  var getMapping = function(cssName) {
    return goog.cssNameMapping_[cssName] || cssName;
  };
  var renameByParts = function(cssName) {
    var parts = cssName.split('-');
    var mapped = [];
    for (var i = 0; i < parts.length; i++) {
      mapped.push(getMapping(parts[i]));
    }
    return mapped.join('-');
  };
  var rename;
  if (goog.cssNameMapping_) {
    rename = goog.cssNameMappingStyle_ == 'BY_WHOLE' ?
        getMapping : renameByParts;
  } else {
    rename = function(a) {
      return a;
    };
  }
  if (opt_modifier) {
    return className + '-' + rename(opt_modifier);
  } else {
    return rename(className);
  }
};
goog.setCssNameMapping = function(mapping, opt_style) {
  goog.cssNameMapping_ = mapping;
  goog.cssNameMappingStyle_ = opt_style;
};
goog.global.CLOSURE_CSS_NAME_MAPPING;
if (!COMPILED && goog.global.CLOSURE_CSS_NAME_MAPPING) {
  goog.cssNameMapping_ = goog.global.CLOSURE_CSS_NAME_MAPPING;
}
goog.getMsg = function(str, opt_values) {
  var values = opt_values || {};
  for (var key in values) {
    var value = ('' + values[key]).replace(/\$/g, '$$$$');
    str = str.replace(new RegExp('\\{\\$' + key + '\\}', 'gi'), value);
  }
  return str;
};
goog.getMsgWithFallback = function(a, b) {
  return a;
};
goog.exportSymbol = function(publicPath, object, opt_objectToExportTo) {
  goog.exportPath_(publicPath, object, opt_objectToExportTo);
};
goog.exportProperty = function(object, publicName, symbol) {
  object[publicName] = symbol;
};
goog.inherits = function(childCtor, parentCtor) {
  function tempCtor() {};
  tempCtor.prototype = parentCtor.prototype;
  childCtor.superClass_ = parentCtor.prototype;
  childCtor.prototype = new tempCtor();
  childCtor.prototype.constructor = childCtor;
};
goog.base = function(me, opt_methodName, var_args) {
  var caller = arguments.callee.caller;
  if (caller.superClass_) {
    return caller.superClass_.constructor.apply(
        me, Array.prototype.slice.call(arguments, 1));
  }
  var args = Array.prototype.slice.call(arguments, 2);
  var foundCaller = false;
  for (var ctor = me.constructor;
       ctor; ctor = ctor.superClass_ && ctor.superClass_.constructor) {
    if (ctor.prototype[opt_methodName] === caller) {
      foundCaller = true;
    } else if (foundCaller) {
      return ctor.prototype[opt_methodName].apply(me, args);
    }
  }
  if (me[opt_methodName] === caller) {
    return me.constructor.prototype[opt_methodName].apply(me, args);
  } else {
    throw Error(
        'goog.base called from a method of one name ' +
        'to a method of a different name');
  }
};
goog.scope = function(fn) {
  fn.call(goog.global);
};

goog.provide('goog.string');
goog.provide('goog.string.Unicode');
goog.string.Unicode = {
  NBSP: '\xa0'
};
goog.string.startsWith = function(str, prefix) {
  return str.lastIndexOf(prefix, 0) == 0;
};
goog.string.endsWith = function(str, suffix) {
  var l = str.length - suffix.length;
  return l >= 0 && str.indexOf(suffix, l) == l;
};
goog.string.caseInsensitiveStartsWith = function(str, prefix) {
  return goog.string.caseInsensitiveCompare(
      prefix, str.substr(0, prefix.length)) == 0;
};
goog.string.caseInsensitiveEndsWith = function(str, suffix) {
  return goog.string.caseInsensitiveCompare(
      suffix, str.substr(str.length - suffix.length, suffix.length)) == 0;
};
goog.string.subs = function(str, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var replacement = String(arguments[i]).replace(/\$/g, '$$$$');
    str = str.replace(/\%s/, replacement);
  }
  return str;
};
goog.string.collapseWhitespace = function(str) {
  return str.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '');
};
goog.string.isEmpty = function(str) {
  return /^[\s\xa0]*$/.test(str);
};
goog.string.isEmptySafe = function(str) {
  return goog.string.isEmpty(goog.string.makeSafe(str));
};
goog.string.isBreakingWhitespace = function(str) {
  return !/[^\t\n\r ]/.test(str);
};
goog.string.isAlpha = function(str) {
  return !/[^a-zA-Z]/.test(str);
};
goog.string.isNumeric = function(str) {
  return !/[^0-9]/.test(str);
};
goog.string.isAlphaNumeric = function(str) {
  return !/[^a-zA-Z0-9]/.test(str);
};
goog.string.isSpace = function(ch) {
  return ch == ' ';
};
goog.string.isUnicodeChar = function(ch) {
  return ch.length == 1 && ch >= ' ' && ch <= '~' ||
         ch >= '\u0080' && ch <= '\uFFFD';
};
goog.string.stripNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)+/g, ' ');
};
goog.string.canonicalizeNewlines = function(str) {
  return str.replace(/(\r\n|\r|\n)/g, '\n');
};
goog.string.normalizeWhitespace = function(str) {
  return str.replace(/\xa0|\s/g, ' ');
};
goog.string.normalizeSpaces = function(str) {
  return str.replace(/\xa0|[ \t]+/g, ' ');
};
goog.string.collapseBreakingSpaces = function(str) {
  return str.replace(/[\t\r\n ]+/g, ' ').replace(
      /^[\t\r\n ]+|[\t\r\n ]+$/g, '');
};
goog.string.trim = function(str) {
  return str.replace(/^[\s\xa0]+|[\s\xa0]+$/g, '');
};
goog.string.trimLeft = function(str) {
  return str.replace(/^[\s\xa0]+/, '');
};
goog.string.trimRight = function(str) {
  return str.replace(/[\s\xa0]+$/, '');
};
goog.string.caseInsensitiveCompare = function(str1, str2) {
  var test1 = String(str1).toLowerCase();
  var test2 = String(str2).toLowerCase();
  if (test1 < test2) {
    return -1;
  } else if (test1 == test2) {
    return 0;
  } else {
    return 1;
  }
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function(str1, str2) {
  if (str1 == str2) {
    return 0;
  }
  if (!str1) {
    return -1;
  }
  if (!str2) {
    return 1;
  }
  var tokens1 = str1.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var tokens2 = str2.toLowerCase().match(goog.string.numerateCompareRegExp_);
  var count = Math.min(tokens1.length, tokens2.length);
  for (var i = 0; i < count; i++) {
    var a = tokens1[i];
    var b = tokens2[i];
    if (a != b) {
      var num1 = parseInt(a, 10);
      if (!isNaN(num1)) {
        var num2 = parseInt(b, 10);
        if (!isNaN(num2) && num1 - num2) {
          return num1 - num2;
        }
      }
      return a < b ? -1 : 1;
    }
  }
  if (tokens1.length != tokens2.length) {
    return tokens1.length - tokens2.length;
  }
  return str1 < str2 ? -1 : 1;
};
goog.string.urlEncode = function(str) {
  return encodeURIComponent(String(str));
};
goog.string.urlDecode = function(str) {
  return decodeURIComponent(str.replace(/\+/g, ' '));
};
goog.string.newLineToBr = function(str, opt_xml) {
  return str.replace(/(\r\n|\r|\n)/g, opt_xml ? '<br />' : '<br>');
};
goog.string.htmlEscape = function(str, opt_isLikelyToContainHtmlChars) {
  if (opt_isLikelyToContainHtmlChars) {
    return str.replace(goog.string.amperRe_, '&amp;')
          .replace(goog.string.ltRe_, '&lt;')
          .replace(goog.string.gtRe_, '&gt;')
          .replace(goog.string.quotRe_, '&quot;');
  } else {
    if (!goog.string.allRe_.test(str)) return str;
    if (str.indexOf('&') != -1) {
      str = str.replace(goog.string.amperRe_, '&amp;');
    }
    if (str.indexOf('<') != -1) {
      str = str.replace(goog.string.ltRe_, '&lt;');
    }
    if (str.indexOf('>') != -1) {
      str = str.replace(goog.string.gtRe_, '&gt;');
    }
    if (str.indexOf('"') != -1) {
      str = str.replace(goog.string.quotRe_, '&quot;');
    }
    return str;
  }
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /\"/g;
goog.string.allRe_ = /[&<>\"]/;
goog.string.unescapeEntities = function(str) {
  if (goog.string.contains(str, '&')) {
    if ('document' in goog.global) {
      return goog.string.unescapeEntitiesUsingDom_(str);
    } else {
      return goog.string.unescapePureXmlEntities_(str);
    }
  }
  return str;
};
goog.string.unescapeEntitiesUsingDom_ = function(str) {
  var seen = {'&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"'};
  var div = document.createElement('div');
  return str.replace(goog.string.HTML_ENTITY_PATTERN_, function(s, entity) {
    var value = seen[s];
    if (value) {
      return value;
    }
    if (entity.charAt(0) == '#') {
      var n = Number('0' + entity.substr(1));
      if (!isNaN(n)) {
        value = String.fromCharCode(n);
      }
    }
    if (!value) {
      div.innerHTML = s + ' ';
      value = div.firstChild.nodeValue.slice(0, -1);
    }
    return seen[s] = value;
  });
};
goog.string.unescapePureXmlEntities_ = function(str) {
  return str.replace(/&([^;]+);/g, function(s, entity) {
    switch (entity) {
      case 'amp':
        return '&';
      case 'lt':
        return '<';
      case 'gt':
        return '>';
      case 'quot':
        return '"';
      default:
        if (entity.charAt(0) == '#') {
          var n = Number('0' + entity.substr(1));
          if (!isNaN(n)) {
            return String.fromCharCode(n);
          }
        }
        return s;
    }
  });
};
goog.string.HTML_ENTITY_PATTERN_ = /&([^;\s<&]+);?/g;
goog.string.whitespaceEscape = function(str, opt_xml) {
  return goog.string.newLineToBr(str.replace(/ /g, ' &#160;'), opt_xml);
};
goog.string.stripQuotes = function(str, quoteChars) {
  var length = quoteChars.length;
  for (var i = 0; i < length; i++) {
    var quoteChar = length == 1 ? quoteChars : quoteChars.charAt(i);
    if (str.charAt(0) == quoteChar && str.charAt(str.length - 1) == quoteChar) {
      return str.substring(1, str.length - 1);
    }
  }
  return str;
};
goog.string.truncate = function(str, chars, opt_protectEscapedCharacters) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }
  if (str.length > chars) {
    str = str.substring(0, chars - 3) + '...';
  }
  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }
  return str;
};
goog.string.truncateMiddle = function(str, chars,
    opt_protectEscapedCharacters, opt_trailingChars) {
  if (opt_protectEscapedCharacters) {
    str = goog.string.unescapeEntities(str);
  }
  if (opt_trailingChars && str.length > chars) {
    if (opt_trailingChars > chars) {
      opt_trailingChars = chars;
    }
    var endPoint = str.length - opt_trailingChars;
    var startPoint = chars - opt_trailingChars;
    str = str.substring(0, startPoint) + '...' + str.substring(endPoint);
  } else if (str.length > chars) {
    var half = Math.floor(chars / 2);
    var endPos = str.length - half;
    half += chars % 2;
    str = str.substring(0, half) + '...' + str.substring(endPos);
  }
  if (opt_protectEscapedCharacters) {
    str = goog.string.htmlEscape(str);
  }
  return str;
};
goog.string.specialEscapeChars_ = {
  '\0': '\\0',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B',
  '"': '\\"',
  '\\': '\\\\'
};
goog.string.jsEscapeCache_ = {
  '\'': '\\\''
};
goog.string.quote = function(s) {
  s = String(s);
  if (s.quote) {
    return s.quote();
  } else {
    var sb = ['"'];
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i);
      var cc = ch.charCodeAt(0);
      sb[i + 1] = goog.string.specialEscapeChars_[ch] ||
          ((cc > 31 && cc < 127) ? ch : goog.string.escapeChar(ch));
    }
    sb.push('"');
    return sb.join('');
  }
};
goog.string.escapeString = function(str) {
  var sb = [];
  for (var i = 0; i < str.length; i++) {
    sb[i] = goog.string.escapeChar(str.charAt(i));
  }
  return sb.join('');
};
goog.string.escapeChar = function(c) {
  if (c in goog.string.jsEscapeCache_) {
    return goog.string.jsEscapeCache_[c];
  }
  if (c in goog.string.specialEscapeChars_) {
    return goog.string.jsEscapeCache_[c] = goog.string.specialEscapeChars_[c];
  }
  var rv = c;
  var cc = c.charCodeAt(0);
  if (cc > 31 && cc < 127) {
    rv = c;
  } else {
    if (cc < 256) {
      rv = '\\x';
      if (cc < 16 || cc > 256) {
        rv += '0';
      }
    } else {
      rv = '\\u';
      if (cc < 4096) {
        rv += '0';
      }
    }
    rv += cc.toString(16).toUpperCase();
  }
  return goog.string.jsEscapeCache_[c] = rv;
};
goog.string.toMap = function(s) {
  var rv = {};
  for (var i = 0; i < s.length; i++) {
    rv[s.charAt(i)] = true;
  }
  return rv;
};
goog.string.contains = function(s, ss) {
  return s.indexOf(ss) != -1;
};
goog.string.countOf = function(s, ss) {
  return s && ss ? s.split(ss).length - 1 : 0;
};
goog.string.removeAt = function(s, index, stringLength) {
  var resultStr = s;
  if (index >= 0 && index < s.length && stringLength > 0) {
    resultStr = s.substr(0, index) +
        s.substr(index + stringLength, s.length - index - stringLength);
  }
  return resultStr;
};
goog.string.remove = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), '');
  return s.replace(re, '');
};
goog.string.removeAll = function(s, ss) {
  var re = new RegExp(goog.string.regExpEscape(ss), 'g');
  return s.replace(re, '');
};
goog.string.regExpEscape = function(s) {
  return String(s).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').
      replace(/\x08/g, '\\x08');
};
goog.string.repeat = function(string, length) {
  return new Array(length + 1).join(string);
};
goog.string.padNumber = function(num, length, opt_precision) {
  var s = goog.isDef(opt_precision) ? num.toFixed(opt_precision) : String(num);
  var index = s.indexOf('.');
  if (index == -1) {
    index = s.length;
  }
  return goog.string.repeat('0', Math.max(0, length - index)) + s;
};
goog.string.makeSafe = function(obj) {
  return obj == null ? '' : String(obj);
};
goog.string.buildString = function(var_args) {
  return Array.prototype.join.call(arguments, '');
};
goog.string.getRandomString = function() {
  var x = 2147483648;
  return Math.floor(Math.random() * x).toString(36) +
         Math.abs(Math.floor(Math.random() * x) ^ goog.now()).toString(36);
};
goog.string.compareVersions = function(version1, version2) {
  var order = 0;
  var v1Subs = goog.string.trim(String(version1)).split('.');
  var v2Subs = goog.string.trim(String(version2)).split('.');
  var subCount = Math.max(v1Subs.length, v2Subs.length);
  for (var subIdx = 0; order == 0 && subIdx < subCount; subIdx++) {
    var v1Sub = v1Subs[subIdx] || '';
    var v2Sub = v2Subs[subIdx] || '';
    var v1CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    var v2CompParser = new RegExp('(\\d*)(\\D*)', 'g');
    do {
      var v1Comp = v1CompParser.exec(v1Sub) || ['', '', ''];
      var v2Comp = v2CompParser.exec(v2Sub) || ['', '', ''];
      if (v1Comp[0].length == 0 && v2Comp[0].length == 0) {
        break;
      }
      var v1CompNum = v1Comp[1].length == 0 ? 0 : parseInt(v1Comp[1], 10);
      var v2CompNum = v2Comp[1].length == 0 ? 0 : parseInt(v2Comp[1], 10);
      order = goog.string.compareElements_(v1CompNum, v2CompNum) ||
          goog.string.compareElements_(v1Comp[2].length == 0,
              v2Comp[2].length == 0) ||
          goog.string.compareElements_(v1Comp[2], v2Comp[2]);
    } while (order == 0);
  }
  return order;
};
goog.string.compareElements_ = function(left, right) {
  if (left < right) {
    return -1;
  } else if (left > right) {
    return 1;
  }
  return 0;
};
goog.string.HASHCODE_MAX_ = 0x100000000;
goog.string.hashCode = function(str) {
  var result = 0;
  for (var i = 0; i < str.length; ++i) {
    result = 31 * result + str.charCodeAt(i);
    result %= goog.string.HASHCODE_MAX_;
  }
  return result;
};
goog.string.uniqueStringCounter_ = Math.random() * 0x80000000 | 0;
goog.string.createUniqueString = function() {
  return 'goog_' + goog.string.uniqueStringCounter_++;
};
goog.string.toNumber = function(str) {
  var num = Number(str);
  if (num == 0 && goog.string.isEmpty(str)) {
    return NaN;
  }
  return num;
};
goog.string.toCamelCase = function(str) {
  return String(str).replace(/\-([a-z])/g, function(all, match) {
    return match.toUpperCase();
  });
};
goog.string.toSelectorCase = function(str) {
  return String(str).replace(/([A-Z])/g, '-$1').toLowerCase();
};
goog.string.toTitleCase = function(str, opt_delimiters) {
  var delimiters = goog.isString(opt_delimiters) ?
      goog.string.regExpEscape(opt_delimiters) : '\\s';
  delimiters = delimiters ? '|[' + delimiters + ']+' : '';
  var regexp = new RegExp('(^' + delimiters + ')([a-z])', 'g');
  return str.replace(regexp, function(all, p1, p2) {
    return p1 + p2.toUpperCase();
  });
};
goog.string.parseInt = function(value) {
  if (isFinite(value)) {
    value = String(value);
  }
  if (goog.isString(value)) {
    return /^\s*-?0x/i.test(value) ?
        parseInt(value, 16) : parseInt(value, 10);
  }
  return NaN;
};

goog.provide('goog.debug.Error');
goog.debug.Error = function(opt_msg) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, goog.debug.Error);
  } else {
    this.stack = new Error().stack || '';
  }
  if (opt_msg) {
    this.message = String(opt_msg);
  }
};
goog.inherits(goog.debug.Error, Error);
goog.debug.Error.prototype.name = 'CustomError';

goog.provide('goog.asserts');
goog.provide('goog.asserts.AssertionError');
goog.require('goog.debug.Error');
goog.require('goog.string');
goog.asserts.ENABLE_ASSERTS = goog.DEBUG;
goog.asserts.AssertionError = function(messagePattern, messageArgs) {
  messageArgs.unshift(messagePattern);
  goog.debug.Error.call(this, goog.string.subs.apply(null, messageArgs));
  messageArgs.shift();
  this.messagePattern = messagePattern;
};
goog.inherits(goog.asserts.AssertionError, goog.debug.Error);
goog.asserts.AssertionError.prototype.name = 'AssertionError';
goog.asserts.doAssertFailure_ =
    function(defaultMessage, defaultArgs, givenMessage, givenArgs) {
  var message = 'Assertion failed';
  if (givenMessage) {
    message += ': ' + givenMessage;
    var args = givenArgs;
  } else if (defaultMessage) {
    message += ': ' + defaultMessage;
    args = defaultArgs;
  }
  throw new goog.asserts.AssertionError('' + message, args || []);
};
goog.asserts.assert = function(condition, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !condition) {
    goog.asserts.doAssertFailure_('', null, opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return condition;
};
goog.asserts.fail = function(opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS) {
    throw new goog.asserts.AssertionError(
        'Failure' + (opt_message ? ': ' + opt_message : ''),
        Array.prototype.slice.call(arguments, 1));
  }
};
goog.asserts.assertNumber = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isNumber(value)) {
    goog.asserts.doAssertFailure_('Expected number but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertString = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isString(value)) {
    goog.asserts.doAssertFailure_('Expected string but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertFunction = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isFunction(value)) {
    goog.asserts.doAssertFailure_('Expected function but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertObject = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isObject(value)) {
    goog.asserts.doAssertFailure_('Expected object but got %s: %s.',
        [goog.typeOf(value), value],
        opt_message, Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertArray = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isArray(value)) {
    goog.asserts.doAssertFailure_('Expected array but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertBoolean = function(value, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !goog.isBoolean(value)) {
    goog.asserts.doAssertFailure_('Expected boolean but got %s: %s.',
        [goog.typeOf(value), value], opt_message,
        Array.prototype.slice.call(arguments, 2));
  }
  return (value);
};
goog.asserts.assertInstanceof = function(value, type, opt_message, var_args) {
  if (goog.asserts.ENABLE_ASSERTS && !(value instanceof type)) {
    goog.asserts.doAssertFailure_('instanceof check failed.', null,
        opt_message, Array.prototype.slice.call(arguments, 3));
  }
  return (value);
};

goog.provide('goog.array');
goog.provide('goog.array.ArrayLike');
goog.require('goog.asserts');
goog.NATIVE_ARRAY_PROTOTYPES = true;
goog.array.ArrayLike;
goog.array.peek = function(array) {
  return array[array.length - 1];
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                     goog.array.ARRAY_PROTOTYPE_.indexOf ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);
      return goog.array.ARRAY_PROTOTYPE_.indexOf.call(arr, obj, opt_fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ?
          0 : (opt_fromIndex < 0 ?
               Math.max(0, arr.length + opt_fromIndex) : opt_fromIndex);
      if (goog.isString(arr)) {
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.indexOf(obj, fromIndex);
      }
      for (var i = fromIndex; i < arr.length; i++) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };
goog.array.lastIndexOf = goog.NATIVE_ARRAY_PROTOTYPES &&
                         goog.array.ARRAY_PROTOTYPE_.lastIndexOf ?
    function(arr, obj, opt_fromIndex) {
      goog.asserts.assert(arr.length != null);
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
      return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(arr, obj, fromIndex);
    } :
    function(arr, obj, opt_fromIndex) {
      var fromIndex = opt_fromIndex == null ? arr.length - 1 : opt_fromIndex;
      if (fromIndex < 0) {
        fromIndex = Math.max(0, arr.length + fromIndex);
      }
      if (goog.isString(arr)) {
        if (!goog.isString(obj) || obj.length != 1) {
          return -1;
        }
        return arr.lastIndexOf(obj, fromIndex);
      }
      for (var i = fromIndex; i >= 0; i--) {
        if (i in arr && arr[i] === obj)
          return i;
      }
      return -1;
    };
goog.array.forEach = goog.NATIVE_ARRAY_PROTOTYPES &&
                     goog.array.ARRAY_PROTOTYPE_.forEach ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);
      goog.array.ARRAY_PROTOTYPE_.forEach.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          f.call(opt_obj, arr2[i], i, arr);
        }
      }
    };
goog.array.forEachRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; --i) {
    if (i in arr2) {
      f.call(opt_obj, arr2[i], i, arr);
    }
  }
};
goog.array.filter = goog.NATIVE_ARRAY_PROTOTYPES &&
                    goog.array.ARRAY_PROTOTYPE_.filter ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);
      return goog.array.ARRAY_PROTOTYPE_.filter.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;
      var res = [];
      var resLength = 0;
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          var val = arr2[i];
          if (f.call(opt_obj, val, i, arr)) {
            res[resLength++] = val;
          }
        }
      }
      return res;
    };
goog.array.map = goog.NATIVE_ARRAY_PROTOTYPES &&
                 goog.array.ARRAY_PROTOTYPE_.map ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);
      return goog.array.ARRAY_PROTOTYPE_.map.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;
      var res = new Array(l);
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2) {
          res[i] = f.call(opt_obj, arr2[i], i, arr);
        }
      }
      return res;
    };
goog.array.reduce = function(arr, f, val, opt_obj) {
  if (arr.reduce) {
    if (opt_obj) {
      return arr.reduce(goog.bind(f, opt_obj), val);
    } else {
      return arr.reduce(f, val);
    }
  }
  var rval = val;
  goog.array.forEach(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};
goog.array.reduceRight = function(arr, f, val, opt_obj) {
  if (arr.reduceRight) {
    if (opt_obj) {
      return arr.reduceRight(goog.bind(f, opt_obj), val);
    } else {
      return arr.reduceRight(f, val);
    }
  }
  var rval = val;
  goog.array.forEachRight(arr, function(val, index) {
    rval = f.call(opt_obj, rval, val, index, arr);
  });
  return rval;
};
goog.array.some = goog.NATIVE_ARRAY_PROTOTYPES &&
                  goog.array.ARRAY_PROTOTYPE_.some ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);
      return goog.array.ARRAY_PROTOTYPE_.some.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
          return true;
        }
      }
      return false;
    };
goog.array.every = goog.NATIVE_ARRAY_PROTOTYPES &&
                   goog.array.ARRAY_PROTOTYPE_.every ?
    function(arr, f, opt_obj) {
      goog.asserts.assert(arr.length != null);
      return goog.array.ARRAY_PROTOTYPE_.every.call(arr, f, opt_obj);
    } :
    function(arr, f, opt_obj) {
      var l = arr.length;
      var arr2 = goog.isString(arr) ? arr.split('') : arr;
      for (var i = 0; i < l; i++) {
        if (i in arr2 && !f.call(opt_obj, arr2[i], i, arr)) {
          return false;
        }
      }
      return true;
    };
goog.array.count = function(arr, f, opt_obj) {
  var count = 0;
  goog.array.forEach(arr, function(element, index, arr) {
    if (f.call(opt_obj, element, index, arr)) {
      ++count;
    }
  }, opt_obj);
  return count;
};
goog.array.find = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};
goog.array.findIndex = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = 0; i < l; i++) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};
goog.array.findRight = function(arr, f, opt_obj) {
  var i = goog.array.findIndexRight(arr, f, opt_obj);
  return i < 0 ? null : goog.isString(arr) ? arr.charAt(i) : arr[i];
};
goog.array.findIndexRight = function(arr, f, opt_obj) {
  var l = arr.length;
  var arr2 = goog.isString(arr) ? arr.split('') : arr;
  for (var i = l - 1; i >= 0; i--) {
    if (i in arr2 && f.call(opt_obj, arr2[i], i, arr)) {
      return i;
    }
  }
  return -1;
};
goog.array.contains = function(arr, obj) {
  return goog.array.indexOf(arr, obj) >= 0;
};
goog.array.isEmpty = function(arr) {
  return arr.length == 0;
};
goog.array.clear = function(arr) {
  if (!goog.isArray(arr)) {
    for (var i = arr.length - 1; i >= 0; i--) {
      delete arr[i];
    }
  }
  arr.length = 0;
};
goog.array.insert = function(arr, obj) {
  if (!goog.array.contains(arr, obj)) {
    arr.push(obj);
  }
};
goog.array.insertAt = function(arr, obj, opt_i) {
  goog.array.splice(arr, opt_i, 0, obj);
};
goog.array.insertArrayAt = function(arr, elementsToAdd, opt_i) {
  goog.partial(goog.array.splice, arr, opt_i, 0).apply(null, elementsToAdd);
};
goog.array.insertBefore = function(arr, obj, opt_obj2) {
  var i;
  if (arguments.length == 2 || (i = goog.array.indexOf(arr, opt_obj2)) < 0) {
    arr.push(obj);
  } else {
    goog.array.insertAt(arr, obj, i);
  }
};
goog.array.remove = function(arr, obj) {
  var i = goog.array.indexOf(arr, obj);
  var rv;
  if ((rv = i >= 0)) {
    goog.array.removeAt(arr, i);
  }
  return rv;
};
goog.array.removeAt = function(arr, i) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.call(arr, i, 1).length == 1;
};
goog.array.removeIf = function(arr, f, opt_obj) {
  var i = goog.array.findIndex(arr, f, opt_obj);
  if (i >= 0) {
    goog.array.removeAt(arr, i);
    return true;
  }
  return false;
};
goog.array.concat = function(var_args) {
  return goog.array.ARRAY_PROTOTYPE_.concat.apply(
      goog.array.ARRAY_PROTOTYPE_, arguments);
};
goog.array.toArray = function(object) {
  var length = object.length;
  if (length > 0) {
    var rv = new Array(length);
    for (var i = 0; i < length; i++) {
      rv[i] = object[i];
    }
    return rv;
  }
  return [];
};
goog.array.clone = goog.array.toArray;
goog.array.extend = function(arr1, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var arr2 = arguments[i];
    var isArrayLike;
    if (goog.isArray(arr2) ||
        (isArrayLike = goog.isArrayLike(arr2)) &&
            arr2.hasOwnProperty('callee')) {
      arr1.push.apply(arr1, arr2);
    } else if (isArrayLike) {
      var len1 = arr1.length;
      var len2 = arr2.length;
      for (var j = 0; j < len2; j++) {
        arr1[len1 + j] = arr2[j];
      }
    } else {
      arr1.push(arr2);
    }
  }
};
goog.array.splice = function(arr, index, howMany, var_args) {
  goog.asserts.assert(arr.length != null);
  return goog.array.ARRAY_PROTOTYPE_.splice.apply(
      arr, goog.array.slice(arguments, 1));
};
goog.array.slice = function(arr, start, opt_end) {
  goog.asserts.assert(arr.length != null);
  if (arguments.length <= 2) {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start);
  } else {
    return goog.array.ARRAY_PROTOTYPE_.slice.call(arr, start, opt_end);
  }
};
goog.array.removeDuplicates = function(arr, opt_rv) {
  var returnArray = opt_rv || arr;
  var seen = {}, cursorInsert = 0, cursorRead = 0;
  while (cursorRead < arr.length) {
    var current = arr[cursorRead++];
    var key = goog.isObject(current) ?
        'o' + goog.getUid(current) :
        (typeof current).charAt(0) + current;
    if (!Object.prototype.hasOwnProperty.call(seen, key)) {
      seen[key] = true;
      returnArray[cursorInsert++] = current;
    }
  }
  returnArray.length = cursorInsert;
};
goog.array.binarySearch = function(arr, target, opt_compareFn) {
  return goog.array.binarySearch_(arr,
      opt_compareFn || goog.array.defaultCompare, false ,
      target);
};
goog.array.binarySelect = function(arr, evaluator, opt_obj) {
  return goog.array.binarySearch_(arr, evaluator, true ,
      undefined , opt_obj);
};
goog.array.binarySearch_ = function(arr, compareFn, isEvaluator, opt_target,
    opt_selfObj) {
  var left = 0;
  var right = arr.length;
  var found;
  while (left < right) {
    var middle = (left + right) >> 1;
    var compareResult;
    if (isEvaluator) {
      compareResult = compareFn.call(opt_selfObj, arr[middle], middle, arr);
    } else {
      compareResult = compareFn(opt_target, arr[middle]);
    }
    if (compareResult > 0) {
      left = middle + 1;
    } else {
      right = middle;
      found = !compareResult;
    }
  }
  return found ? left : ~left;
};
goog.array.sort = function(arr, opt_compareFn) {
  goog.asserts.assert(arr.length != null);
  goog.array.ARRAY_PROTOTYPE_.sort.call(
      arr, opt_compareFn || goog.array.defaultCompare);
};
goog.array.stableSort = function(arr, opt_compareFn) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] = {index: i, value: arr[i]};
  }
  var valueCompareFn = opt_compareFn || goog.array.defaultCompare;
  function stableCompareFn(obj1, obj2) {
    return valueCompareFn(obj1.value, obj2.value) || obj1.index - obj2.index;
  };
  goog.array.sort(arr, stableCompareFn);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = arr[i].value;
  }
};
goog.array.sortObjectsByKey = function(arr, key, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  goog.array.sort(arr, function(a, b) {
    return compare(a[key], b[key]);
  });
};
goog.array.isSorted = function(arr, opt_compareFn, opt_strict) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  for (var i = 1; i < arr.length; i++) {
    var compareResult = compare(arr[i - 1], arr[i]);
    if (compareResult > 0 || compareResult == 0 && opt_strict) {
      return false;
    }
  }
  return true;
};
goog.array.equals = function(arr1, arr2, opt_equalsFn) {
  if (!goog.isArrayLike(arr1) || !goog.isArrayLike(arr2) ||
      arr1.length != arr2.length) {
    return false;
  }
  var l = arr1.length;
  var equalsFn = opt_equalsFn || goog.array.defaultCompareEquality;
  for (var i = 0; i < l; i++) {
    if (!equalsFn(arr1[i], arr2[i])) {
      return false;
    }
  }
  return true;
};
goog.array.compare = function(arr1, arr2, opt_equalsFn) {
  return goog.array.equals(arr1, arr2, opt_equalsFn);
};
goog.array.compare3 = function(arr1, arr2, opt_compareFn) {
  var compare = opt_compareFn || goog.array.defaultCompare;
  var l = Math.min(arr1.length, arr2.length);
  for (var i = 0; i < l; i++) {
    var result = compare(arr1[i], arr2[i]);
    if (result != 0) {
      return result;
    }
  }
  return goog.array.defaultCompare(arr1.length, arr2.length);
};
goog.array.defaultCompare = function(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
};
goog.array.defaultCompareEquality = function(a, b) {
  return a === b;
};
goog.array.binaryInsert = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  if (index < 0) {
    goog.array.insertAt(array, value, -(index + 1));
    return true;
  }
  return false;
};
goog.array.binaryRemove = function(array, value, opt_compareFn) {
  var index = goog.array.binarySearch(array, value, opt_compareFn);
  return (index >= 0) ? goog.array.removeAt(array, index) : false;
};
goog.array.bucket = function(array, sorter) {
  var buckets = {};
  for (var i = 0; i < array.length; i++) {
    var value = array[i];
    var key = sorter(value, i, array);
    if (goog.isDef(key)) {
      var bucket = buckets[key] || (buckets[key] = []);
      bucket.push(value);
    }
  }
  return buckets;
};
goog.array.toObject = function(arr, keyFunc, opt_obj) {
  var ret = {};
  goog.array.forEach(arr, function(element, index) {
    ret[keyFunc.call(opt_obj, element, index, arr)] = element;
  });
  return ret;
};
goog.array.repeat = function(value, n) {
  var array = [];
  for (var i = 0; i < n; i++) {
    array[i] = value;
  }
  return array;
};
goog.array.flatten = function(var_args) {
  var result = [];
  for (var i = 0; i < arguments.length; i++) {
    var element = arguments[i];
    if (goog.isArray(element)) {
      result.push.apply(result, goog.array.flatten.apply(null, element));
    } else {
      result.push(element);
    }
  }
  return result;
};
goog.array.rotate = function(array, n) {
  goog.asserts.assert(array.length != null);
  if (array.length) {
    n %= array.length;
    if (n > 0) {
      goog.array.ARRAY_PROTOTYPE_.unshift.apply(array, array.splice(-n, n));
    } else if (n < 0) {
      goog.array.ARRAY_PROTOTYPE_.push.apply(array, array.splice(0, -n));
    }
  }
  return array;
};
goog.array.zip = function(var_args) {
  if (!arguments.length) {
    return [];
  }
  var result = [];
  for (var i = 0; true; i++) {
    var value = [];
    for (var j = 0; j < arguments.length; j++) {
      var arr = arguments[j];
      if (i >= arr.length) {
        return result;
      }
      value.push(arr[i]);
    }
    result.push(value);
  }
};
goog.array.shuffle = function(arr, opt_randFn) {
  var randFn = opt_randFn || Math.random;
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(randFn() * (i + 1));
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
};

goog.provide('goog.crypt');
goog.require('goog.array');
goog.crypt.stringToByteArray = function(str) {
  var output = [], p = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    while (c > 0xff) {
      output[p++] = c & 0xff;
      c >>= 8;
    }
    output[p++] = c;
  }
  return output;
};
goog.crypt.byteArrayToString = function(array) {
  return String.fromCharCode.apply(null, array);
};
goog.crypt.byteArrayToHex = function(array) {
  return goog.array.map(array, function(numByte) {
    var hexByte = numByte.toString(16);
    return hexByte.length > 1 ? hexByte : '0' + hexByte;
  }).join('');
};
goog.crypt.hexToByteArray = function(hexString) {
  goog.asserts.assert(hexString.length % 2 == 0,
                      'Key string length must be multiple of 2');
  var arr = [];
  for (var i = 0; i < hexString.length; i += 2) {
    arr.push(parseInt(hexString.substring(i, i + 2), 16));
  }
  return arr;
};
goog.crypt.stringToUtf8ByteArray = function(str) {
  str = str.replace(/\r\n/g, '\n');
  var out = [], p = 0;
  for (var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if (c < 128) {
      out[p++] = c;
    } else if (c < 2048) {
      out[p++] = (c >> 6) | 192;
      out[p++] = (c & 63) | 128;
    } else {
      out[p++] = (c >> 12) | 224;
      out[p++] = ((c >> 6) & 63) | 128;
      out[p++] = (c & 63) | 128;
    }
  }
  return out;
};
goog.crypt.utf8ByteArrayToString = function(bytes) {
  var out = [], pos = 0, c = 0;
  while (pos < bytes.length) {
    var c1 = bytes[pos++];
    if (c1 < 128) {
      out[c++] = String.fromCharCode(c1);
    } else if (c1 > 191 && c1 < 224) {
      var c2 = bytes[pos++];
      out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
    } else {
      var c2 = bytes[pos++];
      var c3 = bytes[pos++];
      out[c++] = String.fromCharCode(
          (c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
    }
  }
  return out.join('');
};
goog.crypt.xorByteArray = function(bytes1, bytes2) {
  goog.asserts.assert(
      bytes1.length == bytes2.length,
      'XOR array lengths must match');
  var result = [];
  for (var i = 0; i < bytes1.length; i++) {
    result.push(bytes1[i] ^ bytes2[i]);
  }
  return result;
};

goog.provide('goog.crypt.Hash');
goog.crypt.Hash = function() {};
goog.crypt.Hash.prototype.reset = goog.abstractMethod;
goog.crypt.Hash.prototype.update = goog.abstractMethod;
goog.crypt.Hash.prototype.digest = goog.abstractMethod;

goog.provide('goog.crypt.Md5');
goog.require('goog.crypt.Hash');
goog.crypt.Md5 = function() {
  goog.base(this);
  this.chain_ = new Array(4);
  this.block_ = new Array(64);
  this.blockLength_ = 0;
  this.totalLength_ = 0;
  this.reset();
};
goog.inherits(goog.crypt.Md5, goog.crypt.Hash);
goog.crypt.Md5.prototype.reset = function() {
  this.chain_[0] = 0x67452301;
  this.chain_[1] = 0xefcdab89;
  this.chain_[2] = 0x98badcfe;
  this.chain_[3] = 0x10325476;
  this.blockLength_ = 0;
  this.totalLength_ = 0;
};
goog.crypt.Md5.prototype.compress_ = function(buf, opt_offset) {
  if (!opt_offset) {
    opt_offset = 0;
  }
  var X = new Array(16);
  if (goog.isString(buf)) {
    for (var i = 0; i < 16; ++i) {
      X[i] = (buf.charCodeAt(opt_offset++)) |
             (buf.charCodeAt(opt_offset++) << 8) |
             (buf.charCodeAt(opt_offset++) << 16) |
             (buf.charCodeAt(opt_offset++) << 24);
    }
  } else {
    for (var i = 0; i < 16; ++i) {
      X[i] = (buf[opt_offset++]) |
             (buf[opt_offset++] << 8) |
             (buf[opt_offset++] << 16) |
             (buf[opt_offset++] << 24);
    }
  }
  var A = this.chain_[0];
  var B = this.chain_[1];
  var C = this.chain_[2];
  var D = this.chain_[3];
  var sum = 0;
  sum = (A + (D ^ (B & (C ^ D))) + X[0] + 0xd76aa478) & 0xffffffff;
  A = B + (((sum << 7) & 0xffffffff) | (sum >>> 25));
  sum = (D + (C ^ (A & (B ^ C))) + X[1] + 0xe8c7b756) & 0xffffffff;
  D = A + (((sum << 12) & 0xffffffff) | (sum >>> 20));
  sum = (C + (B ^ (D & (A ^ B))) + X[2] + 0x242070db) & 0xffffffff;
  C = D + (((sum << 17) & 0xffffffff) | (sum >>> 15));
  sum = (B + (A ^ (C & (D ^ A))) + X[3] + 0xc1bdceee) & 0xffffffff;
  B = C + (((sum << 22) & 0xffffffff) | (sum >>> 10));
  sum = (A + (D ^ (B & (C ^ D))) + X[4] + 0xf57c0faf) & 0xffffffff;
  A = B + (((sum << 7) & 0xffffffff) | (sum >>> 25));
  sum = (D + (C ^ (A & (B ^ C))) + X[5] + 0x4787c62a) & 0xffffffff;
  D = A + (((sum << 12) & 0xffffffff) | (sum >>> 20));
  sum = (C + (B ^ (D & (A ^ B))) + X[6] + 0xa8304613) & 0xffffffff;
  C = D + (((sum << 17) & 0xffffffff) | (sum >>> 15));
  sum = (B + (A ^ (C & (D ^ A))) + X[7] + 0xfd469501) & 0xffffffff;
  B = C + (((sum << 22) & 0xffffffff) | (sum >>> 10));
  sum = (A + (D ^ (B & (C ^ D))) + X[8] + 0x698098d8) & 0xffffffff;
  A = B + (((sum << 7) & 0xffffffff) | (sum >>> 25));
  sum = (D + (C ^ (A & (B ^ C))) + X[9] + 0x8b44f7af) & 0xffffffff;
  D = A + (((sum << 12) & 0xffffffff) | (sum >>> 20));
  sum = (C + (B ^ (D & (A ^ B))) + X[10] + 0xffff5bb1) & 0xffffffff;
  C = D + (((sum << 17) & 0xffffffff) | (sum >>> 15));
  sum = (B + (A ^ (C & (D ^ A))) + X[11] + 0x895cd7be) & 0xffffffff;
  B = C + (((sum << 22) & 0xffffffff) | (sum >>> 10));
  sum = (A + (D ^ (B & (C ^ D))) + X[12] + 0x6b901122) & 0xffffffff;
  A = B + (((sum << 7) & 0xffffffff) | (sum >>> 25));
  sum = (D + (C ^ (A & (B ^ C))) + X[13] + 0xfd987193) & 0xffffffff;
  D = A + (((sum << 12) & 0xffffffff) | (sum >>> 20));
  sum = (C + (B ^ (D & (A ^ B))) + X[14] + 0xa679438e) & 0xffffffff;
  C = D + (((sum << 17) & 0xffffffff) | (sum >>> 15));
  sum = (B + (A ^ (C & (D ^ A))) + X[15] + 0x49b40821) & 0xffffffff;
  B = C + (((sum << 22) & 0xffffffff) | (sum >>> 10));
  sum = (A + (C ^ (D & (B ^ C))) + X[1] + 0xf61e2562) & 0xffffffff;
  A = B + (((sum << 5) & 0xffffffff) | (sum >>> 27));
  sum = (D + (B ^ (C & (A ^ B))) + X[6] + 0xc040b340) & 0xffffffff;
  D = A + (((sum << 9) & 0xffffffff) | (sum >>> 23));
  sum = (C + (A ^ (B & (D ^ A))) + X[11] + 0x265e5a51) & 0xffffffff;
  C = D + (((sum << 14) & 0xffffffff) | (sum >>> 18));
  sum = (B + (D ^ (A & (C ^ D))) + X[0] + 0xe9b6c7aa) & 0xffffffff;
  B = C + (((sum << 20) & 0xffffffff) | (sum >>> 12));
  sum = (A + (C ^ (D & (B ^ C))) + X[5] + 0xd62f105d) & 0xffffffff;
  A = B + (((sum << 5) & 0xffffffff) | (sum >>> 27));
  sum = (D + (B ^ (C & (A ^ B))) + X[10] + 0x02441453) & 0xffffffff;
  D = A + (((sum << 9) & 0xffffffff) | (sum >>> 23));
  sum = (C + (A ^ (B & (D ^ A))) + X[15] + 0xd8a1e681) & 0xffffffff;
  C = D + (((sum << 14) & 0xffffffff) | (sum >>> 18));
  sum = (B + (D ^ (A & (C ^ D))) + X[4] + 0xe7d3fbc8) & 0xffffffff;
  B = C + (((sum << 20) & 0xffffffff) | (sum >>> 12));
  sum = (A + (C ^ (D & (B ^ C))) + X[9] + 0x21e1cde6) & 0xffffffff;
  A = B + (((sum << 5) & 0xffffffff) | (sum >>> 27));
  sum = (D + (B ^ (C & (A ^ B))) + X[14] + 0xc33707d6) & 0xffffffff;
  D = A + (((sum << 9) & 0xffffffff) | (sum >>> 23));
  sum = (C + (A ^ (B & (D ^ A))) + X[3] + 0xf4d50d87) & 0xffffffff;
  C = D + (((sum << 14) & 0xffffffff) | (sum >>> 18));
  sum = (B + (D ^ (A & (C ^ D))) + X[8] + 0x455a14ed) & 0xffffffff;
  B = C + (((sum << 20) & 0xffffffff) | (sum >>> 12));
  sum = (A + (C ^ (D & (B ^ C))) + X[13] + 0xa9e3e905) & 0xffffffff;
  A = B + (((sum << 5) & 0xffffffff) | (sum >>> 27));
  sum = (D + (B ^ (C & (A ^ B))) + X[2] + 0xfcefa3f8) & 0xffffffff;
  D = A + (((sum << 9) & 0xffffffff) | (sum >>> 23));
  sum = (C + (A ^ (B & (D ^ A))) + X[7] + 0x676f02d9) & 0xffffffff;
  C = D + (((sum << 14) & 0xffffffff) | (sum >>> 18));
  sum = (B + (D ^ (A & (C ^ D))) + X[12] + 0x8d2a4c8a) & 0xffffffff;
  B = C + (((sum << 20) & 0xffffffff) | (sum >>> 12));
  sum = (A + (B ^ C ^ D) + X[5] + 0xfffa3942) & 0xffffffff;
  A = B + (((sum << 4) & 0xffffffff) | (sum >>> 28));
  sum = (D + (A ^ B ^ C) + X[8] + 0x8771f681) & 0xffffffff;
  D = A + (((sum << 11) & 0xffffffff) | (sum >>> 21));
  sum = (C + (D ^ A ^ B) + X[11] + 0x6d9d6122) & 0xffffffff;
  C = D + (((sum << 16) & 0xffffffff) | (sum >>> 16));
  sum = (B + (C ^ D ^ A) + X[14] + 0xfde5380c) & 0xffffffff;
  B = C + (((sum << 23) & 0xffffffff) | (sum >>> 9));
  sum = (A + (B ^ C ^ D) + X[1] + 0xa4beea44) & 0xffffffff;
  A = B + (((sum << 4) & 0xffffffff) | (sum >>> 28));
  sum = (D + (A ^ B ^ C) + X[4] + 0x4bdecfa9) & 0xffffffff;
  D = A + (((sum << 11) & 0xffffffff) | (sum >>> 21));
  sum = (C + (D ^ A ^ B) + X[7] + 0xf6bb4b60) & 0xffffffff;
  C = D + (((sum << 16) & 0xffffffff) | (sum >>> 16));
  sum = (B + (C ^ D ^ A) + X[10] + 0xbebfbc70) & 0xffffffff;
  B = C + (((sum << 23) & 0xffffffff) | (sum >>> 9));
  sum = (A + (B ^ C ^ D) + X[13] + 0x289b7ec6) & 0xffffffff;
  A = B + (((sum << 4) & 0xffffffff) | (sum >>> 28));
  sum = (D + (A ^ B ^ C) + X[0] + 0xeaa127fa) & 0xffffffff;
  D = A + (((sum << 11) & 0xffffffff) | (sum >>> 21));
  sum = (C + (D ^ A ^ B) + X[3] + 0xd4ef3085) & 0xffffffff;
  C = D + (((sum << 16) & 0xffffffff) | (sum >>> 16));
  sum = (B + (C ^ D ^ A) + X[6] + 0x04881d05) & 0xffffffff;
  B = C + (((sum << 23) & 0xffffffff) | (sum >>> 9));
  sum = (A + (B ^ C ^ D) + X[9] + 0xd9d4d039) & 0xffffffff;
  A = B + (((sum << 4) & 0xffffffff) | (sum >>> 28));
  sum = (D + (A ^ B ^ C) + X[12] + 0xe6db99e5) & 0xffffffff;
  D = A + (((sum << 11) & 0xffffffff) | (sum >>> 21));
  sum = (C + (D ^ A ^ B) + X[15] + 0x1fa27cf8) & 0xffffffff;
  C = D + (((sum << 16) & 0xffffffff) | (sum >>> 16));
  sum = (B + (C ^ D ^ A) + X[2] + 0xc4ac5665) & 0xffffffff;
  B = C + (((sum << 23) & 0xffffffff) | (sum >>> 9));
  sum = (A + (C ^ (B | (~D))) + X[0] + 0xf4292244) & 0xffffffff;
  A = B + (((sum << 6) & 0xffffffff) | (sum >>> 26));
  sum = (D + (B ^ (A | (~C))) + X[7] + 0x432aff97) & 0xffffffff;
  D = A + (((sum << 10) & 0xffffffff) | (sum >>> 22));
  sum = (C + (A ^ (D | (~B))) + X[14] + 0xab9423a7) & 0xffffffff;
  C = D + (((sum << 15) & 0xffffffff) | (sum >>> 17));
  sum = (B + (D ^ (C | (~A))) + X[5] + 0xfc93a039) & 0xffffffff;
  B = C + (((sum << 21) & 0xffffffff) | (sum >>> 11));
  sum = (A + (C ^ (B | (~D))) + X[12] + 0x655b59c3) & 0xffffffff;
  A = B + (((sum << 6) & 0xffffffff) | (sum >>> 26));
  sum = (D + (B ^ (A | (~C))) + X[3] + 0x8f0ccc92) & 0xffffffff;
  D = A + (((sum << 10) & 0xffffffff) | (sum >>> 22));
  sum = (C + (A ^ (D | (~B))) + X[10] + 0xffeff47d) & 0xffffffff;
  C = D + (((sum << 15) & 0xffffffff) | (sum >>> 17));
  sum = (B + (D ^ (C | (~A))) + X[1] + 0x85845dd1) & 0xffffffff;
  B = C + (((sum << 21) & 0xffffffff) | (sum >>> 11));
  sum = (A + (C ^ (B | (~D))) + X[8] + 0x6fa87e4f) & 0xffffffff;
  A = B + (((sum << 6) & 0xffffffff) | (sum >>> 26));
  sum = (D + (B ^ (A | (~C))) + X[15] + 0xfe2ce6e0) & 0xffffffff;
  D = A + (((sum << 10) & 0xffffffff) | (sum >>> 22));
  sum = (C + (A ^ (D | (~B))) + X[6] + 0xa3014314) & 0xffffffff;
  C = D + (((sum << 15) & 0xffffffff) | (sum >>> 17));
  sum = (B + (D ^ (C | (~A))) + X[13] + 0x4e0811a1) & 0xffffffff;
  B = C + (((sum << 21) & 0xffffffff) | (sum >>> 11));
  sum = (A + (C ^ (B | (~D))) + X[4] + 0xf7537e82) & 0xffffffff;
  A = B + (((sum << 6) & 0xffffffff) | (sum >>> 26));
  sum = (D + (B ^ (A | (~C))) + X[11] + 0xbd3af235) & 0xffffffff;
  D = A + (((sum << 10) & 0xffffffff) | (sum >>> 22));
  sum = (C + (A ^ (D | (~B))) + X[2] + 0x2ad7d2bb) & 0xffffffff;
  C = D + (((sum << 15) & 0xffffffff) | (sum >>> 17));
  sum = (B + (D ^ (C | (~A))) + X[9] + 0xeb86d391) & 0xffffffff;
  B = C + (((sum << 21) & 0xffffffff) | (sum >>> 11));
  this.chain_[0] = (this.chain_[0] + A) & 0xffffffff;
  this.chain_[1] = (this.chain_[1] + B) & 0xffffffff;
  this.chain_[2] = (this.chain_[2] + C) & 0xffffffff;
  this.chain_[3] = (this.chain_[3] + D) & 0xffffffff;
};
goog.crypt.Md5.prototype.update = function(bytes, opt_length) {
  if (!goog.isDef(opt_length)) {
    opt_length = bytes.length;
  }
  var lengthMinusBlock = opt_length - 64;
  var block = this.block_;
  var blockLength = this.blockLength_;
  var i = 0;
  while (i < opt_length) {
    if (blockLength == 0) {
      while (i <= lengthMinusBlock) {
        this.compress_(bytes, i);
        i += 64;
      }
    }
    if (goog.isString(bytes)) {
      while (i < opt_length) {
        block[blockLength++] = bytes.charCodeAt(i++);
        if (blockLength == 64) {
          this.compress_(block);
          blockLength = 0;
          break;
        }
      }
    } else {
      while (i < opt_length) {
        block[blockLength++] = bytes[i++];
        if (blockLength == 64) {
          this.compress_(block);
          blockLength = 0;
          break;
        }
      }
    }
  }
  this.blockLength_ = blockLength;
  this.totalLength_ += opt_length;
};
goog.crypt.Md5.prototype.digest = function() {
  var pad = new Array((this.blockLength_ < 56 ? 64 : 128) - this.blockLength_);
  pad[0] = 0x80;
  for (var i = 1; i < pad.length - 8; ++i) {
    pad[i] = 0;
  }
  var totalBits = this.totalLength_ * 8;
  for (var i = pad.length - 8; i < pad.length; ++i) {
    pad[i] = totalBits & 0xff;
    totalBits /= 0x100;
  }
  this.update(pad);
  var digest = new Array(16);
  var n = 0;
  for (var i = 0; i < 4; ++i) {
    for (var j = 0; j < 32; j += 8) {
      digest[n++] = (this.chain_[i] >>> j) & 0xff;
    }
  }
  return digest;
};

goog.provide('goog.math.Long');
goog.math.Long = function(low, high) {
  this.low_ = low | 0;
  this.high_ = high | 0;
};
goog.math.Long.IntCache_ = {};
goog.math.Long.fromInt = function(value) {
  if (-128 <= value && value < 128) {
    var cachedObj = goog.math.Long.IntCache_[value];
    if (cachedObj) {
      return cachedObj;
    }
  }
  var obj = new goog.math.Long(value | 0, value < 0 ? -1 : 0);
  if (-128 <= value && value < 128) {
    goog.math.Long.IntCache_[value] = obj;
  }
  return obj;
};
goog.math.Long.fromNumber = function(value) {
  if (isNaN(value) || !isFinite(value)) {
    return goog.math.Long.ZERO;
  } else if (value <= -goog.math.Long.TWO_PWR_63_DBL_) {
    return goog.math.Long.MIN_VALUE;
  } else if (value + 1 >= goog.math.Long.TWO_PWR_63_DBL_) {
    return goog.math.Long.MAX_VALUE;
  } else if (value < 0) {
    return goog.math.Long.fromNumber(-value).negate();
  } else {
    return new goog.math.Long(
        (value % goog.math.Long.TWO_PWR_32_DBL_) | 0,
        (value / goog.math.Long.TWO_PWR_32_DBL_) | 0);
  }
};
goog.math.Long.fromBits = function(lowBits, highBits) {
  return new goog.math.Long(lowBits, highBits);
};
goog.math.Long.fromString = function(str, opt_radix) {
  if (str.length == 0) {
    throw Error('number format error: empty string');
  }
  var radix = opt_radix || 10;
  if (radix < 2 || 36 < radix) {
    throw Error('radix out of range: ' + radix);
  }
  if (str.charAt(0) == '-') {
    return goog.math.Long.fromString(str.substring(1), radix).negate();
  } else if (str.indexOf('-') >= 0) {
    throw Error('number format error: interior "-" character: ' + str);
  }
  var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 8));
  var result = goog.math.Long.ZERO;
  for (var i = 0; i < str.length; i += 8) {
    var size = Math.min(8, str.length - i);
    var value = parseInt(str.substring(i, i + size), radix);
    if (size < 8) {
      var power = goog.math.Long.fromNumber(Math.pow(radix, size));
      result = result.multiply(power).add(goog.math.Long.fromNumber(value));
    } else {
      result = result.multiply(radixToPower);
      result = result.add(goog.math.Long.fromNumber(value));
    }
  }
  return result;
};
goog.math.Long.TWO_PWR_16_DBL_ = 1 << 16;
goog.math.Long.TWO_PWR_24_DBL_ = 1 << 24;
goog.math.Long.TWO_PWR_32_DBL_ =
    goog.math.Long.TWO_PWR_16_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
goog.math.Long.TWO_PWR_31_DBL_ =
    goog.math.Long.TWO_PWR_32_DBL_ / 2;
goog.math.Long.TWO_PWR_48_DBL_ =
    goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_16_DBL_;
goog.math.Long.TWO_PWR_64_DBL_ =
    goog.math.Long.TWO_PWR_32_DBL_ * goog.math.Long.TWO_PWR_32_DBL_;
goog.math.Long.TWO_PWR_63_DBL_ =
    goog.math.Long.TWO_PWR_64_DBL_ / 2;
goog.math.Long.ZERO = goog.math.Long.fromInt(0);
goog.math.Long.ONE = goog.math.Long.fromInt(1);
goog.math.Long.NEG_ONE = goog.math.Long.fromInt(-1);
goog.math.Long.MAX_VALUE =
    goog.math.Long.fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0);
goog.math.Long.MIN_VALUE = goog.math.Long.fromBits(0, 0x80000000 | 0);
goog.math.Long.TWO_PWR_24_ = goog.math.Long.fromInt(1 << 24);
goog.math.Long.prototype.toInt = function() {
  return this.low_;
};
goog.math.Long.prototype.toNumber = function() {
  return this.high_ * goog.math.Long.TWO_PWR_32_DBL_ +
         this.getLowBitsUnsigned();
};
goog.math.Long.prototype.toString = function(opt_radix) {
  var radix = opt_radix || 10;
  if (radix < 2 || 36 < radix) {
    throw Error('radix out of range: ' + radix);
  }
  if (this.isZero()) {
    return '0';
  }
  if (this.isNegative()) {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      var radixLong = goog.math.Long.fromNumber(radix);
      var div = this.div(radixLong);
      var rem = div.multiply(radixLong).subtract(this);
      return div.toString(radix) + rem.toInt().toString(radix);
    } else {
      return '-' + this.negate().toString(radix);
    }
  }
  var radixToPower = goog.math.Long.fromNumber(Math.pow(radix, 6));
  var rem = this;
  var result = '';
  while (true) {
    var remDiv = rem.div(radixToPower);
    var intval = rem.subtract(remDiv.multiply(radixToPower)).toInt();
    var digits = intval.toString(radix);
    rem = remDiv;
    if (rem.isZero()) {
      return digits + result;
    } else {
      while (digits.length < 6) {
        digits = '0' + digits;
      }
      result = '' + digits + result;
    }
  }
};
goog.math.Long.prototype.getHighBits = function() {
  return this.high_;
};
goog.math.Long.prototype.getLowBits = function() {
  return this.low_;
};
goog.math.Long.prototype.getLowBitsUnsigned = function() {
  return (this.low_ >= 0) ?
      this.low_ : goog.math.Long.TWO_PWR_32_DBL_ + this.low_;
};
goog.math.Long.prototype.getNumBitsAbs = function() {
  if (this.isNegative()) {
    if (this.equals(goog.math.Long.MIN_VALUE)) {
      return 64;
    } else {
      return this.negate().getNumBitsAbs();
    }
  } else {
    var val = this.high_ != 0 ? this.high_ : this.low_;
    for (var bit = 31; bit > 0; bit--) {
      if ((val & (1 << bit)) != 0) {
        break;
      }
    }
    return this.high_ != 0 ? bit + 33 : bit + 1;
  }
};
goog.math.Long.prototype.isZero = function() {
  return this.high_ == 0 && this.low_ == 0;
};
goog.math.Long.prototype.isNegative = function() {
  return this.high_ < 0;
};
goog.math.Long.prototype.isOdd = function() {
  return (this.low_ & 1) == 1;
};
goog.math.Long.prototype.equals = function(other) {
  return (this.high_ == other.high_) && (this.low_ == other.low_);
};
goog.math.Long.prototype.notEquals = function(other) {
  return (this.high_ != other.high_) || (this.low_ != other.low_);
};
goog.math.Long.prototype.lessThan = function(other) {
  return this.compare(other) < 0;
};
goog.math.Long.prototype.lessThanOrEqual = function(other) {
  return this.compare(other) <= 0;
};
goog.math.Long.prototype.greaterThan = function(other) {
  return this.compare(other) > 0;
};
goog.math.Long.prototype.greaterThanOrEqual = function(other) {
  return this.compare(other) >= 0;
};
goog.math.Long.prototype.compare = function(other) {
  if (this.equals(other)) {
    return 0;
  }
  var thisNeg = this.isNegative();
  var otherNeg = other.isNegative();
  if (thisNeg && !otherNeg) {
    return -1;
  }
  if (!thisNeg && otherNeg) {
    return 1;
  }
  if (this.subtract(other).isNegative()) {
    return -1;
  } else {
    return 1;
  }
};
goog.math.Long.prototype.negate = function() {
  if (this.equals(goog.math.Long.MIN_VALUE)) {
    return goog.math.Long.MIN_VALUE;
  } else {
    return this.not().add(goog.math.Long.ONE);
  }
};
goog.math.Long.prototype.add = function(other) {
  var a48 = this.high_ >>> 16;
  var a32 = this.high_ & 0xFFFF;
  var a16 = this.low_ >>> 16;
  var a00 = this.low_ & 0xFFFF;
  var b48 = other.high_ >>> 16;
  var b32 = other.high_ & 0xFFFF;
  var b16 = other.low_ >>> 16;
  var b00 = other.low_ & 0xFFFF;
  var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
  c00 += a00 + b00;
  c16 += c00 >>> 16;
  c00 &= 0xFFFF;
  c16 += a16 + b16;
  c32 += c16 >>> 16;
  c16 &= 0xFFFF;
  c32 += a32 + b32;
  c48 += c32 >>> 16;
  c32 &= 0xFFFF;
  c48 += a48 + b48;
  c48 &= 0xFFFF;
  return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
};
goog.math.Long.prototype.subtract = function(other) {
  return this.add(other.negate());
};
goog.math.Long.prototype.multiply = function(other) {
  if (this.isZero()) {
    return goog.math.Long.ZERO;
  } else if (other.isZero()) {
    return goog.math.Long.ZERO;
  }
  if (this.equals(goog.math.Long.MIN_VALUE)) {
    return other.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
  } else if (other.equals(goog.math.Long.MIN_VALUE)) {
    return this.isOdd() ? goog.math.Long.MIN_VALUE : goog.math.Long.ZERO;
  }
  if (this.isNegative()) {
    if (other.isNegative()) {
      return this.negate().multiply(other.negate());
    } else {
      return this.negate().multiply(other).negate();
    }
  } else if (other.isNegative()) {
    return this.multiply(other.negate()).negate();
  }
  if (this.lessThan(goog.math.Long.TWO_PWR_24_) &&
      other.lessThan(goog.math.Long.TWO_PWR_24_)) {
    return goog.math.Long.fromNumber(this.toNumber() * other.toNumber());
  }
  var a48 = this.high_ >>> 16;
  var a32 = this.high_ & 0xFFFF;
  var a16 = this.low_ >>> 16;
  var a00 = this.low_ & 0xFFFF;
  var b48 = other.high_ >>> 16;
  var b32 = other.high_ & 0xFFFF;
  var b16 = other.low_ >>> 16;
  var b00 = other.low_ & 0xFFFF;
  var c48 = 0, c32 = 0, c16 = 0, c00 = 0;
  c00 += a00 * b00;
  c16 += c00 >>> 16;
  c00 &= 0xFFFF;
  c16 += a16 * b00;
  c32 += c16 >>> 16;
  c16 &= 0xFFFF;
  c16 += a00 * b16;
  c32 += c16 >>> 16;
  c16 &= 0xFFFF;
  c32 += a32 * b00;
  c48 += c32 >>> 16;
  c32 &= 0xFFFF;
  c32 += a16 * b16;
  c48 += c32 >>> 16;
  c32 &= 0xFFFF;
  c32 += a00 * b32;
  c48 += c32 >>> 16;
  c32 &= 0xFFFF;
  c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
  c48 &= 0xFFFF;
  return goog.math.Long.fromBits((c16 << 16) | c00, (c48 << 16) | c32);
};
goog.math.Long.prototype.div = function(other) {
  if (other.isZero()) {
    throw Error('division by zero');
  } else if (this.isZero()) {
    return goog.math.Long.ZERO;
  }
  if (this.equals(goog.math.Long.MIN_VALUE)) {
    if (other.equals(goog.math.Long.ONE) ||
        other.equals(goog.math.Long.NEG_ONE)) {
      return goog.math.Long.MIN_VALUE;
    } else if (other.equals(goog.math.Long.MIN_VALUE)) {
      return goog.math.Long.ONE;
    } else {
      var halfThis = this.shiftRight(1);
      var approx = halfThis.div(other).shiftLeft(1);
      if (approx.equals(goog.math.Long.ZERO)) {
        return other.isNegative() ? goog.math.Long.ONE : goog.math.Long.NEG_ONE;
      } else {
        var rem = this.subtract(other.multiply(approx));
        var result = approx.add(rem.div(other));
        return result;
      }
    }
  } else if (other.equals(goog.math.Long.MIN_VALUE)) {
    return goog.math.Long.ZERO;
  }
  if (this.isNegative()) {
    if (other.isNegative()) {
      return this.negate().div(other.negate());
    } else {
      return this.negate().div(other).negate();
    }
  } else if (other.isNegative()) {
    return this.div(other.negate()).negate();
  }
  var res = goog.math.Long.ZERO;
  var rem = this;
  while (rem.greaterThanOrEqual(other)) {
    var approx = Math.max(1, Math.floor(rem.toNumber() / other.toNumber()));
    var log2 = Math.ceil(Math.log(approx) / Math.LN2);
    var delta = (log2 <= 48) ? 1 : Math.pow(2, log2 - 48);
    var approxRes = goog.math.Long.fromNumber(approx);
    var approxRem = approxRes.multiply(other);
    while (approxRem.isNegative() || approxRem.greaterThan(rem)) {
      approx -= delta;
      approxRes = goog.math.Long.fromNumber(approx);
      approxRem = approxRes.multiply(other);
    }
    if (approxRes.isZero()) {
      approxRes = goog.math.Long.ONE;
    }
    res = res.add(approxRes);
    rem = rem.subtract(approxRem);
  }
  return res;
};
goog.math.Long.prototype.modulo = function(other) {
  return this.subtract(this.div(other).multiply(other));
};
goog.math.Long.prototype.not = function() {
  return goog.math.Long.fromBits(~this.low_, ~this.high_);
};
goog.math.Long.prototype.and = function(other) {
  return goog.math.Long.fromBits(this.low_ & other.low_,
                                 this.high_ & other.high_);
};
goog.math.Long.prototype.or = function(other) {
  return goog.math.Long.fromBits(this.low_ | other.low_,
                                 this.high_ | other.high_);
};
goog.math.Long.prototype.xor = function(other) {
  return goog.math.Long.fromBits(this.low_ ^ other.low_,
                                 this.high_ ^ other.high_);
};
goog.math.Long.prototype.shiftLeft = function(numBits) {
  numBits &= 63;
  if (numBits == 0) {
    return this;
  } else {
    var low = this.low_;
    if (numBits < 32) {
      var high = this.high_;
      return goog.math.Long.fromBits(
          low << numBits,
          (high << numBits) | (low >>> (32 - numBits)));
    } else {
      return goog.math.Long.fromBits(0, low << (numBits - 32));
    }
  }
};
goog.math.Long.prototype.shiftRight = function(numBits) {
  numBits &= 63;
  if (numBits == 0) {
    return this;
  } else {
    var high = this.high_;
    if (numBits < 32) {
      var low = this.low_;
      return goog.math.Long.fromBits(
          (low >>> numBits) | (high << (32 - numBits)),
          high >> numBits);
    } else {
      return goog.math.Long.fromBits(
          high >> (numBits - 32),
          high >= 0 ? 0 : -1);
    }
  }
};
goog.math.Long.prototype.shiftRightUnsigned = function(numBits) {
  numBits &= 63;
  if (numBits == 0) {
    return this;
  } else {
    var high = this.high_;
    if (numBits < 32) {
      var low = this.low_;
      return goog.math.Long.fromBits(
          (low >>> numBits) | (high << (32 - numBits)),
          high >>> numBits);
    } else if (numBits == 32) {
      return goog.math.Long.fromBits(high, 0);
    } else {
      return goog.math.Long.fromBits(high >>> (numBits - 32), 0);
    }
  }
};

goog.provide('goog.object');
goog.object.forEach = function(obj, f, opt_obj) {
  for (var key in obj) {
    f.call(opt_obj, obj[key], key, obj);
  }
};
goog.object.filter = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      res[key] = obj[key];
    }
  }
  return res;
};
goog.object.map = function(obj, f, opt_obj) {
  var res = {};
  for (var key in obj) {
    res[key] = f.call(opt_obj, obj[key], key, obj);
  }
  return res;
};
goog.object.some = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (f.call(opt_obj, obj[key], key, obj)) {
      return true;
    }
  }
  return false;
};
goog.object.every = function(obj, f, opt_obj) {
  for (var key in obj) {
    if (!f.call(opt_obj, obj[key], key, obj)) {
      return false;
    }
  }
  return true;
};
goog.object.getCount = function(obj) {
  var rv = 0;
  for (var key in obj) {
    rv++;
  }
  return rv;
};
goog.object.getAnyKey = function(obj) {
  for (var key in obj) {
    return key;
  }
};
goog.object.getAnyValue = function(obj) {
  for (var key in obj) {
    return obj[key];
  }
};
goog.object.contains = function(obj, val) {
  return goog.object.containsValue(obj, val);
};
goog.object.getValues = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = obj[key];
  }
  return res;
};
goog.object.getKeys = function(obj) {
  var res = [];
  var i = 0;
  for (var key in obj) {
    res[i++] = key;
  }
  return res;
};
goog.object.getValueByKeys = function(obj, var_args) {
  var isArrayLike = goog.isArrayLike(var_args);
  var keys = isArrayLike ? var_args : arguments;
  for (var i = isArrayLike ? 0 : 1; i < keys.length; i++) {
    obj = obj[keys[i]];
    if (!goog.isDef(obj)) {
      break;
    }
  }
  return obj;
};
goog.object.containsKey = function(obj, key) {
  return key in obj;
};
goog.object.containsValue = function(obj, val) {
  for (var key in obj) {
    if (obj[key] == val) {
      return true;
    }
  }
  return false;
};
goog.object.findKey = function(obj, f, opt_this) {
  for (var key in obj) {
    if (f.call(opt_this, obj[key], key, obj)) {
      return key;
    }
  }
  return undefined;
};
goog.object.findValue = function(obj, f, opt_this) {
  var key = goog.object.findKey(obj, f, opt_this);
  return key && obj[key];
};
goog.object.isEmpty = function(obj) {
  for (var key in obj) {
    return false;
  }
  return true;
};
goog.object.clear = function(obj) {
  for (var i in obj) {
    delete obj[i];
  }
};
goog.object.remove = function(obj, key) {
  var rv;
  if ((rv = key in obj)) {
    delete obj[key];
  }
  return rv;
};
goog.object.add = function(obj, key, val) {
  if (key in obj) {
    throw Error('The object already contains the key "' + key + '"');
  }
  goog.object.set(obj, key, val);
};
goog.object.get = function(obj, key, opt_val) {
  if (key in obj) {
    return obj[key];
  }
  return opt_val;
};
goog.object.set = function(obj, key, value) {
  obj[key] = value;
};
goog.object.setIfUndefined = function(obj, key, value) {
  return key in obj ? obj[key] : (obj[key] = value);
};
goog.object.clone = function(obj) {
  var res = {};
  for (var key in obj) {
    res[key] = obj[key];
  }
  return res;
};
goog.object.unsafeClone = function(obj) {
  var type = goog.typeOf(obj);
  if (type == 'object' || type == 'array') {
    if (obj.clone) {
      return obj.clone();
    }
    var clone = type == 'array' ? [] : {};
    for (var key in obj) {
      clone[key] = goog.object.unsafeClone(obj[key]);
    }
    return clone;
  }
  return obj;
};
goog.object.transpose = function(obj) {
  var transposed = {};
  for (var key in obj) {
    transposed[obj[key]] = key;
  }
  return transposed;
};
goog.object.PROTOTYPE_FIELDS_ = [
  'constructor',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  'toString',
  'valueOf'
];
goog.object.extend = function(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }
    for (var j = 0; j < goog.object.PROTOTYPE_FIELDS_.length; j++) {
      key = goog.object.PROTOTYPE_FIELDS_[j];
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }
};
goog.object.create = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.create.apply(null, arguments[0]);
  }
  if (argLength % 2) {
    throw Error('Uneven number of arguments');
  }
  var rv = {};
  for (var i = 0; i < argLength; i += 2) {
    rv[arguments[i]] = arguments[i + 1];
  }
  return rv;
};
goog.object.createSet = function(var_args) {
  var argLength = arguments.length;
  if (argLength == 1 && goog.isArray(arguments[0])) {
    return goog.object.createSet.apply(null, arguments[0]);
  }
  var rv = {};
  for (var i = 0; i < argLength; i++) {
    rv[arguments[i]] = true;
  }
  return rv;
};
goog.object.createImmutableView = function(obj) {
  var result = obj;
  if (Object.isFrozen && !Object.isFrozen(obj)) {
    result = Object.create(obj);
    Object.freeze(result);
  }
  return result;
};
goog.object.isImmutableView = function(obj) {
  return !!Object.isFrozen && Object.isFrozen(obj);
};

goog.provide('goog.iter');
goog.provide('goog.iter.Iterator');
goog.provide('goog.iter.StopIteration');
goog.require('goog.array');
goog.require('goog.asserts');
goog.iter.Iterable;
if ('StopIteration' in goog.global) {
  goog.iter.StopIteration = goog.global['StopIteration'];
} else {
  goog.iter.StopIteration = Error('StopIteration');
}
goog.iter.Iterator = function() {};
goog.iter.Iterator.prototype.next = function() {
  throw goog.iter.StopIteration;
};
goog.iter.Iterator.prototype.__iterator__ = function(opt_keys) {
  return this;
};
goog.iter.toIterator = function(iterable) {
  if (iterable instanceof goog.iter.Iterator) {
    return iterable;
  }
  if (typeof iterable.__iterator__ == 'function') {
    return iterable.__iterator__(false);
  }
  if (goog.isArrayLike(iterable)) {
    var i = 0;
    var newIter = new goog.iter.Iterator;
    newIter.next = function() {
      while (true) {
        if (i >= iterable.length) {
          throw goog.iter.StopIteration;
        }
        if (!(i in iterable)) {
          i++;
          continue;
        }
        return iterable[i++];
      }
    };
    return newIter;
  }
  throw Error('Not implemented');
};
goog.iter.forEach = function(iterable, f, opt_obj) {
  if (goog.isArrayLike(iterable)) {
    try {
      goog.array.forEach( (iterable), f,
                         opt_obj);
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  } else {
    iterable = goog.iter.toIterator(iterable);
    try {
      while (true) {
        f.call(opt_obj, iterable.next(), undefined, iterable);
      }
    } catch (ex) {
      if (ex !== goog.iter.StopIteration) {
        throw ex;
      }
    }
  }
};
goog.iter.filter = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterator.next();
      if (f.call(opt_obj, val, undefined, iterator)) {
        return val;
      }
    }
  };
  return newIter;
};
goog.iter.range = function(startOrStop, opt_stop, opt_step) {
  var start = 0;
  var stop = startOrStop;
  var step = opt_step || 1;
  if (arguments.length > 1) {
    start = startOrStop;
    stop = opt_stop;
  }
  if (step == 0) {
    throw Error('Range step argument must not be zero');
  }
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    if (step > 0 && start >= stop || step < 0 && start <= stop) {
      throw goog.iter.StopIteration;
    }
    var rv = start;
    start += step;
    return rv;
  };
  return newIter;
};
goog.iter.join = function(iterable, deliminator) {
  return goog.iter.toArray(iterable).join(deliminator);
};
goog.iter.map = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      var val = iterator.next();
      return f.call(opt_obj, val, undefined, iterator);
    }
  };
  return newIter;
};
goog.iter.reduce = function(iterable, f, val, opt_obj) {
  var rval = val;
  goog.iter.forEach(iterable, function(val) {
    rval = f.call(opt_obj, rval, val);
  });
  return rval;
};
goog.iter.some = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while (true) {
      if (f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return true;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return false;
};
goog.iter.every = function(iterable, f, opt_obj) {
  iterable = goog.iter.toIterator(iterable);
  try {
    while (true) {
      if (!f.call(opt_obj, iterable.next(), undefined, iterable)) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    }
  }
  return true;
};
goog.iter.chain = function(var_args) {
  var args = arguments;
  var length = args.length;
  var i = 0;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    try {
      if (i >= length) {
        throw goog.iter.StopIteration;
      }
      var current = goog.iter.toIterator(args[i]);
      return current.next();
    } catch (ex) {
      if (ex !== goog.iter.StopIteration || i >= length) {
        throw ex;
      } else {
        i++;
        return this.next();
      }
    }
  };
  return newIter;
};
goog.iter.dropWhile = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var dropping = true;
  newIter.next = function() {
    while (true) {
      var val = iterator.next();
      if (dropping && f.call(opt_obj, val, undefined, iterator)) {
        continue;
      } else {
        dropping = false;
      }
      return val;
    }
  };
  return newIter;
};
goog.iter.takeWhile = function(iterable, f, opt_obj) {
  var iterator = goog.iter.toIterator(iterable);
  var newIter = new goog.iter.Iterator;
  var taking = true;
  newIter.next = function() {
    while (true) {
      if (taking) {
        var val = iterator.next();
        if (f.call(opt_obj, val, undefined, iterator)) {
          return val;
        } else {
          taking = false;
        }
      } else {
        throw goog.iter.StopIteration;
      }
    }
  };
  return newIter;
};
goog.iter.toArray = function(iterable) {
  if (goog.isArrayLike(iterable)) {
    return goog.array.toArray( (iterable));
  }
  iterable = goog.iter.toIterator(iterable);
  var array = [];
  goog.iter.forEach(iterable, function(val) {
    array.push(val);
  });
  return array;
};
goog.iter.equals = function(iterable1, iterable2) {
  iterable1 = goog.iter.toIterator(iterable1);
  iterable2 = goog.iter.toIterator(iterable2);
  var b1, b2;
  try {
    while (true) {
      b1 = b2 = false;
      var val1 = iterable1.next();
      b1 = true;
      var val2 = iterable2.next();
      b2 = true;
      if (val1 != val2) {
        return false;
      }
    }
  } catch (ex) {
    if (ex !== goog.iter.StopIteration) {
      throw ex;
    } else {
      if (b1 && !b2) {
        return false;
      }
      if (!b2) {
        try {
          val2 = iterable2.next();
          return false;
        } catch (ex1) {
          if (ex1 !== goog.iter.StopIteration) {
            throw ex1;
          }
          return true;
        }
      }
    }
  }
  return false;
};
goog.iter.nextOrValue = function(iterable, defaultValue) {
  try {
    return goog.iter.toIterator(iterable).next();
  } catch (e) {
    if (e != goog.iter.StopIteration) {
      throw e;
    }
    return defaultValue;
  }
};
goog.iter.product = function(var_args) {
  var someArrayEmpty = goog.array.some(arguments, function(arr) {
    return !arr.length;
  });
  if (someArrayEmpty || !arguments.length) {
    return new goog.iter.Iterator();
  }
  var iter = new goog.iter.Iterator();
  var arrays = arguments;
  var indicies = goog.array.repeat(0, arrays.length);
  iter.next = function() {
    if (indicies) {
      var retVal = goog.array.map(indicies, function(valueIndex, arrayIndex) {
        return arrays[arrayIndex][valueIndex];
      });
      for (var i = indicies.length - 1; i >= 0; i--) {
        goog.asserts.assert(indicies);
        if (indicies[i] < arrays[i].length - 1) {
          indicies[i]++;
          break;
        }
        if (i == 0) {
          indicies = null;
          break;
        }
        indicies[i] = 0;
      }
      return retVal;
    }
    throw goog.iter.StopIteration;
  };
  return iter;
};
goog.iter.cycle = function(iterable) {
  var baseIterator = goog.iter.toIterator(iterable);
  var cache = [];
  var cacheIndex = 0;
  var iter = new goog.iter.Iterator();
  var useCache = false;
  iter.next = function() {
    var returnElement = null;
    if (!useCache) {
      try {
        returnElement = baseIterator.next();
        cache.push(returnElement);
        return returnElement;
      } catch (e) {
        if (e != goog.iter.StopIteration || goog.array.isEmpty(cache)) {
          throw e;
        }
        useCache = true;
      }
    }
    returnElement = cache[cacheIndex];
    cacheIndex = (cacheIndex + 1) % cache.length;
    return returnElement;
  };
  return iter;
};

goog.provide('goog.structs');
goog.require('goog.array');
goog.require('goog.object');
goog.structs.getCount = function(col) {
  if (typeof col.getCount == 'function') {
    return col.getCount();
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return col.length;
  }
  return goog.object.getCount(col);
};
goog.structs.getValues = function(col) {
  if (typeof col.getValues == 'function') {
    return col.getValues();
  }
  if (goog.isString(col)) {
    return col.split('');
  }
  if (goog.isArrayLike(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(col[i]);
    }
    return rv;
  }
  return goog.object.getValues(col);
};
goog.structs.getKeys = function(col) {
  if (typeof col.getKeys == 'function') {
    return col.getKeys();
  }
  if (typeof col.getValues == 'function') {
    return undefined;
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    var rv = [];
    var l = col.length;
    for (var i = 0; i < l; i++) {
      rv.push(i);
    }
    return rv;
  }
  return goog.object.getKeys(col);
};
goog.structs.contains = function(col, val) {
  if (typeof col.contains == 'function') {
    return col.contains(val);
  }
  if (typeof col.containsValue == 'function') {
    return col.containsValue(val);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.contains( (col), val);
  }
  return goog.object.containsValue(col, val);
};
goog.structs.isEmpty = function(col) {
  if (typeof col.isEmpty == 'function') {
    return col.isEmpty();
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.isEmpty( (col));
  }
  return goog.object.isEmpty(col);
};
goog.structs.clear = function(col) {
  if (typeof col.clear == 'function') {
    col.clear();
  } else if (goog.isArrayLike(col)) {
    goog.array.clear( (col));
  } else {
    goog.object.clear(col);
  }
};
goog.structs.forEach = function(col, f, opt_obj) {
  if (typeof col.forEach == 'function') {
    col.forEach(f, opt_obj);
  } else if (goog.isArrayLike(col) || goog.isString(col)) {
    goog.array.forEach( (col), f, opt_obj);
  } else {
    var keys = goog.structs.getKeys(col);
    var values = goog.structs.getValues(col);
    var l = values.length;
    for (var i = 0; i < l; i++) {
      f.call(opt_obj, values[i], keys && keys[i], col);
    }
  }
};
goog.structs.filter = function(col, f, opt_obj) {
  if (typeof col.filter == 'function') {
    return col.filter(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.filter( (col), f, opt_obj);
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0; i < l; i++) {
      if (f.call(opt_obj, values[i], keys[i], col)) {
        rv[keys[i]] = values[i];
      }
    }
  } else {
    rv = [];
    for (var i = 0; i < l; i++) {
      if (f.call(opt_obj, values[i], undefined, col)) {
        rv.push(values[i]);
      }
    }
  }
  return rv;
};
goog.structs.map = function(col, f, opt_obj) {
  if (typeof col.map == 'function') {
    return col.map(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.map( (col), f, opt_obj);
  }
  var rv;
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  if (keys) {
    rv = {};
    for (var i = 0; i < l; i++) {
      rv[keys[i]] = f.call(opt_obj, values[i], keys[i], col);
    }
  } else {
    rv = [];
    for (var i = 0; i < l; i++) {
      rv[i] = f.call(opt_obj, values[i], undefined, col);
    }
  }
  return rv;
};
goog.structs.some = function(col, f, opt_obj) {
  if (typeof col.some == 'function') {
    return col.some(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.some( (col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (f.call(opt_obj, values[i], keys && keys[i], col)) {
      return true;
    }
  }
  return false;
};
goog.structs.every = function(col, f, opt_obj) {
  if (typeof col.every == 'function') {
    return col.every(f, opt_obj);
  }
  if (goog.isArrayLike(col) || goog.isString(col)) {
    return goog.array.every( (col), f, opt_obj);
  }
  var keys = goog.structs.getKeys(col);
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    if (!f.call(opt_obj, values[i], keys && keys[i], col)) {
      return false;
    }
  }
  return true;
};

goog.provide('goog.structs.Collection');
goog.structs.Collection = function() {};
goog.structs.Collection.prototype.add;
goog.structs.Collection.prototype.remove;
goog.structs.Collection.prototype.contains;
goog.structs.Collection.prototype.getCount;

goog.provide('goog.structs.Node');
goog.structs.Node = function(key, value) {
  this.key_ = key;
  this.value_ = value;
};
goog.structs.Node.prototype.getKey = function() {
  return this.key_;
};
goog.structs.Node.prototype.getValue = function() {
  return this.value_;
};
goog.structs.Node.prototype.clone = function() {
  return new goog.structs.Node(this.key_, this.value_);
};

goog.provide('goog.structs.Heap');
goog.require('goog.array');
goog.require('goog.object');
goog.require('goog.structs.Node');
goog.structs.Heap = function(opt_heap) {
  this.nodes_ = [];
  if (opt_heap) {
    this.insertAll(opt_heap);
  }
};
goog.structs.Heap.prototype.insert = function(key, value) {
  var node = new goog.structs.Node(key, value);
  var nodes = this.nodes_;
  nodes.push(node);
  this.moveUp_(nodes.length - 1);
};
goog.structs.Heap.prototype.insertAll = function(heap) {
  var keys, values;
  if (heap instanceof goog.structs.Heap) {
    keys = heap.getKeys();
    values = heap.getValues();
    if (heap.getCount() <= 0) {
      var nodes = this.nodes_;
      for (var i = 0; i < keys.length; i++) {
        nodes.push(new goog.structs.Node(keys[i], values[i]));
      }
      return;
    }
  } else {
    keys = goog.object.getKeys(heap);
    values = goog.object.getValues(heap);
  }
  for (var i = 0; i < keys.length; i++) {
    this.insert(keys[i], values[i]);
  }
};
goog.structs.Heap.prototype.remove = function() {
  var nodes = this.nodes_;
  var count = nodes.length;
  var rootNode = nodes[0];
  if (count <= 0) {
    return undefined;
  } else if (count == 1) {
    goog.array.clear(nodes);
  } else {
    nodes[0] = nodes.pop();
    this.moveDown_(0);
  }
  return rootNode.getValue();
};
goog.structs.Heap.prototype.peek = function() {
  var nodes = this.nodes_;
  if (nodes.length == 0) {
    return undefined;
  }
  return nodes[0].getValue();
};
goog.structs.Heap.prototype.peekKey = function() {
  return this.nodes_[0] && this.nodes_[0].getKey();
};
goog.structs.Heap.prototype.moveDown_ = function(index) {
  var nodes = this.nodes_;
  var count = nodes.length;
  var node = nodes[index];
  while (index < (count >> 1)) {
    var leftChildIndex = this.getLeftChildIndex_(index);
    var rightChildIndex = this.getRightChildIndex_(index);
    var smallerChildIndex = rightChildIndex < count &&
        nodes[rightChildIndex].getKey() < nodes[leftChildIndex].getKey() ?
        rightChildIndex : leftChildIndex;
    if (nodes[smallerChildIndex].getKey() > node.getKey()) {
      break;
    }
    nodes[index] = nodes[smallerChildIndex];
    index = smallerChildIndex;
  }
  nodes[index] = node;
};
goog.structs.Heap.prototype.moveUp_ = function(index) {
  var nodes = this.nodes_;
  var node = nodes[index];
  while (index > 0) {
    var parentIndex = this.getParentIndex_(index);
    if (nodes[parentIndex].getKey() > node.getKey()) {
      nodes[index] = nodes[parentIndex];
      index = parentIndex;
    } else {
      break;
    }
  }
  nodes[index] = node;
};
goog.structs.Heap.prototype.getLeftChildIndex_ = function(index) {
  return index * 2 + 1;
};
goog.structs.Heap.prototype.getRightChildIndex_ = function(index) {
  return index * 2 + 2;
};
goog.structs.Heap.prototype.getParentIndex_ = function(index) {
  return (index - 1) >> 1;
};
goog.structs.Heap.prototype.getValues = function() {
  var nodes = this.nodes_;
  var rv = [];
  var l = nodes.length;
  for (var i = 0; i < l; i++) {
    rv.push(nodes[i].getValue());
  }
  return rv;
};
goog.structs.Heap.prototype.getKeys = function() {
  var nodes = this.nodes_;
  var rv = [];
  var l = nodes.length;
  for (var i = 0; i < l; i++) {
    rv.push(nodes[i].getKey());
  }
  return rv;
};
goog.structs.Heap.prototype.containsValue = function(val) {
  return goog.array.some(this.nodes_, function(node) {
    return node.getValue() == val;
  });
};
goog.structs.Heap.prototype.containsKey = function(key) {
  return goog.array.some(this.nodes_, function(node) {
    return node.getKey() == key;
  });
};
goog.structs.Heap.prototype.clone = function() {
  return new goog.structs.Heap(this);
};
goog.structs.Heap.prototype.getCount = function() {
  return this.nodes_.length;
};
goog.structs.Heap.prototype.isEmpty = function() {
  return goog.array.isEmpty(this.nodes_);
};
goog.structs.Heap.prototype.clear = function() {
  goog.array.clear(this.nodes_);
};

goog.provide('goog.structs.Queue');
goog.require('goog.array');
goog.structs.Queue = function() {
  this.elements_ = [];
};
goog.structs.Queue.prototype.head_ = 0;
goog.structs.Queue.prototype.tail_ = 0;
goog.structs.Queue.prototype.enqueue = function(element) {
  this.elements_[this.tail_++] = element;
};
goog.structs.Queue.prototype.dequeue = function() {
  if (this.head_ == this.tail_) {
    return undefined;
  }
  var result = this.elements_[this.head_];
  delete this.elements_[this.head_];
  this.head_++;
  return result;
};
goog.structs.Queue.prototype.peek = function() {
  if (this.head_ == this.tail_) {
    return undefined;
  }
  return this.elements_[this.head_];
};
goog.structs.Queue.prototype.getCount = function() {
  return this.tail_ - this.head_;
};
goog.structs.Queue.prototype.isEmpty = function() {
  return this.tail_ - this.head_ == 0;
};
goog.structs.Queue.prototype.clear = function() {
  this.elements_.length = 0;
  this.head_ = 0;
  this.tail_ = 0;
};
goog.structs.Queue.prototype.contains = function(obj) {
  return goog.array.contains(this.elements_, obj);
};
goog.structs.Queue.prototype.remove = function(obj) {
  var index = goog.array.indexOf(this.elements_, obj);
  if (index < 0) {
    return false;
  }
  if (index == this.head_) {
    this.dequeue();
  } else {
    goog.array.removeAt(this.elements_, index);
    this.tail_--;
  }
  return true;
};
goog.structs.Queue.prototype.getValues = function() {
  return this.elements_.slice(this.head_, this.tail_);
};

goog.provide('goog.structs.Map');
goog.require('goog.iter.Iterator');
goog.require('goog.iter.StopIteration');
goog.require('goog.object');
goog.require('goog.structs');
goog.structs.Map = function(opt_map, var_args) {
  this.map_ = {};
  this.keys_ = [];
  var argLength = arguments.length;
  if (argLength > 1) {
    if (argLength % 2) {
      throw Error('Uneven number of arguments');
    }
    for (var i = 0; i < argLength; i += 2) {
      this.set(arguments[i], arguments[i + 1]);
    }
  } else if (opt_map) {
    this.addAll( (opt_map));
  }
};
goog.structs.Map.prototype.count_ = 0;
goog.structs.Map.prototype.version_ = 0;
goog.structs.Map.prototype.getCount = function() {
  return this.count_;
};
goog.structs.Map.prototype.getValues = function() {
  this.cleanupKeysArray_();
  var rv = [];
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    rv.push(this.map_[key]);
  }
  return rv;
};
goog.structs.Map.prototype.getKeys = function() {
  this.cleanupKeysArray_();
  return (this.keys_.concat());
};
goog.structs.Map.prototype.containsKey = function(key) {
  return goog.structs.Map.hasKey_(this.map_, key);
};
goog.structs.Map.prototype.containsValue = function(val) {
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    if (goog.structs.Map.hasKey_(this.map_, key) && this.map_[key] == val) {
      return true;
    }
  }
  return false;
};
goog.structs.Map.prototype.equals = function(otherMap, opt_equalityFn) {
  if (this === otherMap) {
    return true;
  }
  if (this.count_ != otherMap.getCount()) {
    return false;
  }
  var equalityFn = opt_equalityFn || goog.structs.Map.defaultEquals;
  this.cleanupKeysArray_();
  for (var key, i = 0; key = this.keys_[i]; i++) {
    if (!equalityFn(this.get(key), otherMap.get(key))) {
      return false;
    }
  }
  return true;
};
goog.structs.Map.defaultEquals = function(a, b) {
  return a === b;
};
goog.structs.Map.prototype.isEmpty = function() {
  return this.count_ == 0;
};
goog.structs.Map.prototype.clear = function() {
  this.map_ = {};
  this.keys_.length = 0;
  this.count_ = 0;
  this.version_ = 0;
};
goog.structs.Map.prototype.remove = function(key) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    delete this.map_[key];
    this.count_--;
    this.version_++;
    if (this.keys_.length > 2 * this.count_) {
      this.cleanupKeysArray_();
    }
    return true;
  }
  return false;
};
goog.structs.Map.prototype.cleanupKeysArray_ = function() {
  if (this.count_ != this.keys_.length) {
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (goog.structs.Map.hasKey_(this.map_, key)) {
        this.keys_[destIndex++] = key;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
  if (this.count_ != this.keys_.length) {
    var seen = {};
    var srcIndex = 0;
    var destIndex = 0;
    while (srcIndex < this.keys_.length) {
      var key = this.keys_[srcIndex];
      if (!(goog.structs.Map.hasKey_(seen, key))) {
        this.keys_[destIndex++] = key;
        seen[key] = 1;
      }
      srcIndex++;
    }
    this.keys_.length = destIndex;
  }
};
goog.structs.Map.prototype.get = function(key, opt_val) {
  if (goog.structs.Map.hasKey_(this.map_, key)) {
    return this.map_[key];
  }
  return opt_val;
};
goog.structs.Map.prototype.set = function(key, value) {
  if (!(goog.structs.Map.hasKey_(this.map_, key))) {
    this.count_++;
    this.keys_.push(key);
    this.version_++;
  }
  this.map_[key] = value;
};
goog.structs.Map.prototype.addAll = function(map) {
  var keys, values;
  if (map instanceof goog.structs.Map) {
    keys = map.getKeys();
    values = map.getValues();
  } else {
    keys = goog.object.getKeys(map);
    values = goog.object.getValues(map);
  }
  for (var i = 0; i < keys.length; i++) {
    this.set(keys[i], values[i]);
  }
};
goog.structs.Map.prototype.clone = function() {
  return new goog.structs.Map(this);
};
goog.structs.Map.prototype.transpose = function() {
  var transposed = new goog.structs.Map();
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    var value = this.map_[key];
    transposed.set(value, key);
  }
  return transposed;
};
goog.structs.Map.prototype.toObject = function() {
  this.cleanupKeysArray_();
  var obj = {};
  for (var i = 0; i < this.keys_.length; i++) {
    var key = this.keys_[i];
    obj[key] = this.map_[key];
  }
  return obj;
};
goog.structs.Map.prototype.getKeyIterator = function() {
  return this.__iterator__(true);
};
goog.structs.Map.prototype.getValueIterator = function() {
  return this.__iterator__(false);
};
goog.structs.Map.prototype.__iterator__ = function(opt_keys) {
  this.cleanupKeysArray_();
  var i = 0;
  var keys = this.keys_;
  var map = this.map_;
  var version = this.version_;
  var selfObj = this;
  var newIter = new goog.iter.Iterator;
  newIter.next = function() {
    while (true) {
      if (version != selfObj.version_) {
        throw Error('The map has changed since the iterator was created');
      }
      if (i >= keys.length) {
        throw goog.iter.StopIteration;
      }
      var key = keys[i++];
      return opt_keys ? key : map[key];
    }
  };
  return newIter;
};
goog.structs.Map.hasKey_ = function(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

goog.provide('goog.structs.Set');
goog.require('goog.structs');
goog.require('goog.structs.Collection');
goog.require('goog.structs.Map');
goog.structs.Set = function(opt_values) {
  this.map_ = new goog.structs.Map;
  if (opt_values) {
    this.addAll(opt_values);
  }
};
goog.structs.Set.getKey_ = function(val) {
  var type = typeof val;
  if (type == 'object' && val || type == 'function') {
    return 'o' + goog.getUid( (val));
  } else {
    return type.substr(0, 1) + val;
  }
};
goog.structs.Set.prototype.getCount = function() {
  return this.map_.getCount();
};
goog.structs.Set.prototype.add = function(element) {
  this.map_.set(goog.structs.Set.getKey_(element), element);
};
goog.structs.Set.prototype.addAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.add(values[i]);
  }
};
goog.structs.Set.prototype.removeAll = function(col) {
  var values = goog.structs.getValues(col);
  var l = values.length;
  for (var i = 0; i < l; i++) {
    this.remove(values[i]);
  }
};
goog.structs.Set.prototype.remove = function(element) {
  return this.map_.remove(goog.structs.Set.getKey_(element));
};
goog.structs.Set.prototype.clear = function() {
  this.map_.clear();
};
goog.structs.Set.prototype.isEmpty = function() {
  return this.map_.isEmpty();
};
goog.structs.Set.prototype.contains = function(element) {
  return this.map_.containsKey(goog.structs.Set.getKey_(element));
};
goog.structs.Set.prototype.containsAll = function(col) {
  return goog.structs.every(col, this.contains, this);
};
goog.structs.Set.prototype.intersection = function(col) {
  var result = new goog.structs.Set();
  var values = goog.structs.getValues(col);
  for (var i = 0; i < values.length; i++) {
    var value = values[i];
    if (this.contains(value)) {
      result.add(value);
    }
  }
  return result;
};
goog.structs.Set.prototype.difference = function(col) {
  var result = this.clone();
  result.removeAll(col);
  return result;
};
goog.structs.Set.prototype.getValues = function() {
  return this.map_.getValues();
};
goog.structs.Set.prototype.clone = function() {
  return new goog.structs.Set(this);
};
goog.structs.Set.prototype.equals = function(col) {
  return this.getCount() == goog.structs.getCount(col) && this.isSubsetOf(col);
};
goog.structs.Set.prototype.isSubsetOf = function(col) {
  var colCount = goog.structs.getCount(col);
  if (this.getCount() > colCount) {
    return false;
  }
  if (!(col instanceof goog.structs.Set) && colCount > 5) {
    col = new goog.structs.Set(col);
  }
  return goog.structs.every(this, function(value) {
    return goog.structs.contains(col, value);
  });
};
goog.structs.Set.prototype.__iterator__ = function(opt_keys) {
  return this.map_.__iterator__(false);
};

var dbits;
var canary = 0xdeadbeefcafe;
var j_lm = ((canary&0xffffff)==0xefcafe);
function BigInteger(a,b,c) {
  this.data = [];
  if(a != null)
    if("number" == typeof a) this.fromNumber(a,b,c);
    else if(b == null && "string" != typeof a) this.fromString(a,256);
    else this.fromString(a,b);
}
function nbi() { return new BigInteger(null); }
function am1(i,x,w,j,c,n) {
  while(--n >= 0) {
    var v = x*this.data[i++]+w.data[j]+c;
    c = Math.floor(v/0x4000000);
    w.data[j++] = v&0x3ffffff;
  }
  return c;
}
function am2(i,x,w,j,c,n) {
  var xl = x&0x7fff, xh = x>>15;
  while(--n >= 0) {
    var l = this.data[i]&0x7fff;
    var h = this.data[i++]>>15;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x7fff)<<15)+w.data[j]+(c&0x3fffffff);
    c = (l>>>30)+(m>>>15)+xh*h+(c>>>30);
    w.data[j++] = l&0x3fffffff;
  }
  return c;
}
function am3(i,x,w,j,c,n) {
  var xl = x&0x3fff, xh = x>>14;
  while(--n >= 0) {
    var l = this.data[i]&0x3fff;
    var h = this.data[i++]>>14;
    var m = xh*l+h*xl;
    l = xl*l+((m&0x3fff)<<14)+w.data[j]+c;
    c = (l>>28)+(m>>14)+xh*h;
    w.data[j++] = l&0xfffffff;
  }
  return c;
}
if(typeof(navigator) === 'undefined')
{
   BigInteger.prototype.am = am3;
   dbits = 28;
}
else if(j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
  BigInteger.prototype.am = am2;
  dbits = 30;
}
else if(j_lm && (navigator.appName != "Netscape")) {
  BigInteger.prototype.am = am1;
  dbits = 26;
}
else {
  BigInteger.prototype.am = am3;
  dbits = 28;
}
BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1<<dbits)-1);
BigInteger.prototype.DV = (1<<dbits);
var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2,BI_FP);
BigInteger.prototype.F1 = BI_FP-dbits;
BigInteger.prototype.F2 = 2*dbits-BI_FP;
var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
var BI_RC = new Array();
var rr,vv;
rr = "0".charCodeAt(0);
for(vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
rr = "a".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
rr = "A".charCodeAt(0);
for(vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
function int2char(n) { return BI_RM.charAt(n); }
function intAt(s,i) {
  var c = BI_RC[s.charCodeAt(i)];
  return (c==null)?-1:c;
}
function bnpCopyTo(r) {
  for(var i = this.t-1; i >= 0; --i) r.data[i] = this.data[i];
  r.t = this.t;
  r.s = this.s;
}
function bnpFromInt(x) {
  this.t = 1;
  this.s = (x<0)?-1:0;
  if(x > 0) this.data[0] = x;
  else if(x < -1) this.data[0] = x+DV;
  else this.t = 0;
}
function nbv(i) { var r = nbi(); r.fromInt(i); return r; }
function bnpFromString(s,b) {
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 256) k = 8;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else { this.fromRadix(s,b); return; }
  this.t = 0;
  this.s = 0;
  var i = s.length, mi = false, sh = 0;
  while(--i >= 0) {
    var x = (k==8)?s[i]&0xff:intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-") mi = true;
      continue;
    }
    mi = false;
    if(sh == 0)
      this.data[this.t++] = x;
    else if(sh+k > this.DB) {
      this.data[this.t-1] |= (x&((1<<(this.DB-sh))-1))<<sh;
      this.data[this.t++] = (x>>(this.DB-sh));
    }
    else
      this.data[this.t-1] |= x<<sh;
    sh += k;
    if(sh >= this.DB) sh -= this.DB;
  }
  if(k == 8 && (s[0]&0x80) != 0) {
    this.s = -1;
    if(sh > 0) this.data[this.t-1] |= ((1<<(this.DB-sh))-1)<<sh;
  }
  this.clamp();
  if(mi) BigInteger.ZERO.subTo(this,this);
}
function bnpClamp() {
  var c = this.s&this.DM;
  while(this.t > 0 && this.data[this.t-1] == c) --this.t;
}
function bnToString(b) {
  if(this.s < 0) return "-"+this.negate().toString(b);
  var k;
  if(b == 16) k = 4;
  else if(b == 8) k = 3;
  else if(b == 2) k = 1;
  else if(b == 32) k = 5;
  else if(b == 4) k = 2;
  else return this.toRadix(b);
  var km = (1<<k)-1, d, m = false, r = "", i = this.t;
  var p = this.DB-(i*this.DB)%k;
  if(i-- > 0) {
    if(p < this.DB && (d = this.data[i]>>p) > 0) { m = true; r = int2char(d); }
    while(i >= 0) {
      if(p < k) {
        d = (this.data[i]&((1<<p)-1))<<(k-p);
        d |= this.data[--i]>>(p+=this.DB-k);
      }
      else {
        d = (this.data[i]>>(p-=k))&km;
        if(p <= 0) { p += this.DB; --i; }
      }
      if(d > 0) m = true;
      if(m) r += int2char(d);
    }
  }
  return m?r:"0";
}
function bnNegate() { var r = nbi(); BigInteger.ZERO.subTo(this,r); return r; }
function bnAbs() { return (this.s<0)?this.negate():this; }
function bnCompareTo(a) {
  var r = this.s-a.s;
  if(r != 0) return r;
  var i = this.t;
  r = i-a.t;
  if(r != 0) return (this.s<0)?-r:r;
  while(--i >= 0) if((r=this.data[i]-a.data[i]) != 0) return r;
  return 0;
}
function nbits(x) {
  var r = 1, t;
  if((t=x>>>16) != 0) { x = t; r += 16; }
  if((t=x>>8) != 0) { x = t; r += 8; }
  if((t=x>>4) != 0) { x = t; r += 4; }
  if((t=x>>2) != 0) { x = t; r += 2; }
  if((t=x>>1) != 0) { x = t; r += 1; }
  return r;
}
function bnBitLength() {
  if(this.t <= 0) return 0;
  return this.DB*(this.t-1)+nbits(this.data[this.t-1]^(this.s&this.DM));
}
function bnpDLShiftTo(n,r) {
  var i;
  for(i = this.t-1; i >= 0; --i) r.data[i+n] = this.data[i];
  for(i = n-1; i >= 0; --i) r.data[i] = 0;
  r.t = this.t+n;
  r.s = this.s;
}
function bnpDRShiftTo(n,r) {
  for(var i = n; i < this.t; ++i) r.data[i-n] = this.data[i];
  r.t = Math.max(this.t-n,0);
  r.s = this.s;
}
function bnpLShiftTo(n,r) {
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<cbs)-1;
  var ds = Math.floor(n/this.DB), c = (this.s<<bs)&this.DM, i;
  for(i = this.t-1; i >= 0; --i) {
    r.data[i+ds+1] = (this.data[i]>>cbs)|c;
    c = (this.data[i]&bm)<<bs;
  }
  for(i = ds-1; i >= 0; --i) r.data[i] = 0;
  r.data[ds] = c;
  r.t = this.t+ds+1;
  r.s = this.s;
  r.clamp();
}
function bnpRShiftTo(n,r) {
  r.s = this.s;
  var ds = Math.floor(n/this.DB);
  if(ds >= this.t) { r.t = 0; return; }
  var bs = n%this.DB;
  var cbs = this.DB-bs;
  var bm = (1<<bs)-1;
  r.data[0] = this.data[ds]>>bs;
  for(var i = ds+1; i < this.t; ++i) {
    r.data[i-ds-1] |= (this.data[i]&bm)<<cbs;
    r.data[i-ds] = this.data[i]>>bs;
  }
  if(bs > 0) r.data[this.t-ds-1] |= (this.s&bm)<<cbs;
  r.t = this.t-ds;
  r.clamp();
}
function bnpSubTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this.data[i]-a.data[i];
    r.data[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c -= a.s;
    while(i < this.t) {
      c += this.data[i];
      r.data[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c -= a.data[i];
      r.data[i++] = c&this.DM;
      c >>= this.DB;
    }
    c -= a.s;
  }
  r.s = (c<0)?-1:0;
  if(c < -1) r.data[i++] = this.DV+c;
  else if(c > 0) r.data[i++] = c;
  r.t = i;
  r.clamp();
}
function bnpMultiplyTo(a,r) {
  var x = this.abs(), y = a.abs();
  var i = x.t;
  r.t = i+y.t;
  while(--i >= 0) r.data[i] = 0;
  for(i = 0; i < y.t; ++i) r.data[i+x.t] = x.am(0,y.data[i],r,i,0,x.t);
  r.s = 0;
  r.clamp();
  if(this.s != a.s) BigInteger.ZERO.subTo(r,r);
}
function bnpSquareTo(r) {
  var x = this.abs();
  var i = r.t = 2*x.t;
  while(--i >= 0) r.data[i] = 0;
  for(i = 0; i < x.t-1; ++i) {
    var c = x.am(i,x.data[i],r,2*i,0,1);
    if((r.data[i+x.t]+=x.am(i+1,2*x.data[i],r,2*i+1,c,x.t-i-1)) >= x.DV) {
      r.data[i+x.t] -= x.DV;
      r.data[i+x.t+1] = 1;
    }
  }
  if(r.t > 0) r.data[r.t-1] += x.am(i,x.data[i],r,2*i,0,1);
  r.s = 0;
  r.clamp();
}
function bnpDivRemTo(m,q,r) {
  var pm = m.abs();
  if(pm.t <= 0) return;
  var pt = this.abs();
  if(pt.t < pm.t) {
    if(q != null) q.fromInt(0);
    if(r != null) this.copyTo(r);
    return;
  }
  if(r == null) r = nbi();
  var y = nbi(), ts = this.s, ms = m.s;
  var nsh = this.DB-nbits(pm.data[pm.t-1]);
  if(nsh > 0) { pm.lShiftTo(nsh,y); pt.lShiftTo(nsh,r); }
  else { pm.copyTo(y); pt.copyTo(r); }
  var ys = y.t;
  var y0 = y.data[ys-1];
  if(y0 == 0) return;
  var yt = y0*(1<<this.F1)+((ys>1)?y.data[ys-2]>>this.F2:0);
  var d1 = this.FV/yt, d2 = (1<<this.F1)/yt, e = 1<<this.F2;
  var i = r.t, j = i-ys, t = (q==null)?nbi():q;
  y.dlShiftTo(j,t);
  if(r.compareTo(t) >= 0) {
    r.data[r.t++] = 1;
    r.subTo(t,r);
  }
  BigInteger.ONE.dlShiftTo(ys,t);
  t.subTo(y,y);
  while(y.t < ys) y.data[y.t++] = 0;
  while(--j >= 0) {
    var qd = (r.data[--i]==y0)?this.DM:Math.floor(r.data[i]*d1+(r.data[i-1]+e)*d2);
    if((r.data[i]+=y.am(0,qd,r,j,0,ys)) < qd) {
      y.dlShiftTo(j,t);
      r.subTo(t,r);
      while(r.data[i] < --qd) r.subTo(t,r);
    }
  }
  if(q != null) {
    r.drShiftTo(ys,q);
    if(ts != ms) BigInteger.ZERO.subTo(q,q);
  }
  r.t = ys;
  r.clamp();
  if(nsh > 0) r.rShiftTo(nsh,r);
  if(ts < 0) BigInteger.ZERO.subTo(r,r);
}
function bnMod(a) {
  var r = nbi();
  this.abs().divRemTo(a,null,r);
  if(this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r,r);
  return r;
}
function Classic(m) { this.m = m; }
function cConvert(x) {
  if(x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
  else return x;
}
function cRevert(x) { return x; }
function cReduce(x) { x.divRemTo(this.m,null,x); }
function cMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
function cSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
Classic.prototype.convert = cConvert;
Classic.prototype.revert = cRevert;
Classic.prototype.reduce = cReduce;
Classic.prototype.mulTo = cMulTo;
Classic.prototype.sqrTo = cSqrTo;
function bnpInvDigit() {
  if(this.t < 1) return 0;
  var x = this.data[0];
  if((x&1) == 0) return 0;
  var y = x&3;
  y = (y*(2-(x&0xf)*y))&0xf;
  y = (y*(2-(x&0xff)*y))&0xff;
  y = (y*(2-(((x&0xffff)*y)&0xffff)))&0xffff;
  y = (y*(2-x*y%this.DV))%this.DV;
  return (y>0)?this.DV-y:-y;
}
function Montgomery(m) {
  this.m = m;
  this.mp = m.invDigit();
  this.mpl = this.mp&0x7fff;
  this.mph = this.mp>>15;
  this.um = (1<<(m.DB-15))-1;
  this.mt2 = 2*m.t;
}
function montConvert(x) {
  var r = nbi();
  x.abs().dlShiftTo(this.m.t,r);
  r.divRemTo(this.m,null,r);
  if(x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r,r);
  return r;
}
function montRevert(x) {
  var r = nbi();
  x.copyTo(r);
  this.reduce(r);
  return r;
}
function montReduce(x) {
  while(x.t <= this.mt2)
    x.data[x.t++] = 0;
  for(var i = 0; i < this.m.t; ++i) {
    var j = x.data[i]&0x7fff;
    var u0 = (j*this.mpl+(((j*this.mph+(x.data[i]>>15)*this.mpl)&this.um)<<15))&x.DM;
    j = i+this.m.t;
    x.data[j] += this.m.am(0,u0,x,i,0,this.m.t);
    while(x.data[j] >= x.DV) { x.data[j] -= x.DV; x.data[++j]++; }
  }
  x.clamp();
  x.drShiftTo(this.m.t,x);
  if(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}
function montSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
function montMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
Montgomery.prototype.convert = montConvert;
Montgomery.prototype.revert = montRevert;
Montgomery.prototype.reduce = montReduce;
Montgomery.prototype.mulTo = montMulTo;
Montgomery.prototype.sqrTo = montSqrTo;
function bnpIsEven() { return ((this.t>0)?(this.data[0]&1):this.s) == 0; }
function bnpExp(e,z) {
  if(e > 0xffffffff || e < 1) return BigInteger.ONE;
  var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e)-1;
  g.copyTo(r);
  while(--i >= 0) {
    z.sqrTo(r,r2);
    if((e&(1<<i)) > 0) z.mulTo(r2,g,r);
    else { var t = r; r = r2; r2 = t; }
  }
  return z.revert(r);
}
function bnModPowInt(e,m) {
  var z;
  if(e < 256 || m.isEven()) z = new Classic(m); else z = new Montgomery(m);
  return this.exp(e,z);
}
BigInteger.prototype.copyTo = bnpCopyTo;
BigInteger.prototype.fromInt = bnpFromInt;
BigInteger.prototype.fromString = bnpFromString;
BigInteger.prototype.clamp = bnpClamp;
BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
BigInteger.prototype.drShiftTo = bnpDRShiftTo;
BigInteger.prototype.lShiftTo = bnpLShiftTo;
BigInteger.prototype.rShiftTo = bnpRShiftTo;
BigInteger.prototype.subTo = bnpSubTo;
BigInteger.prototype.multiplyTo = bnpMultiplyTo;
BigInteger.prototype.squareTo = bnpSquareTo;
BigInteger.prototype.divRemTo = bnpDivRemTo;
BigInteger.prototype.invDigit = bnpInvDigit;
BigInteger.prototype.isEven = bnpIsEven;
BigInteger.prototype.exp = bnpExp;
BigInteger.prototype.toString = bnToString;
BigInteger.prototype.negate = bnNegate;
BigInteger.prototype.abs = bnAbs;
BigInteger.prototype.compareTo = bnCompareTo;
BigInteger.prototype.bitLength = bnBitLength;
BigInteger.prototype.mod = bnMod;
BigInteger.prototype.modPowInt = bnModPowInt;
BigInteger.ZERO = nbv(0);
BigInteger.ONE = nbv(1);

function bnClone() { var r = nbi(); this.copyTo(r); return r; }
function bnIntValue() {
  if(this.s < 0) {
    if(this.t == 1) return this.data[0]-this.DV;
    else if(this.t == 0) return -1;
  }
  else if(this.t == 1) return this.data[0];
  else if(this.t == 0) return 0;
  return ((this.data[1]&((1<<(32-this.DB))-1))<<this.DB)|this.data[0];
}
function bnByteValue() { return (this.t==0)?this.s:(this.data[0]<<24)>>24; }
function bnShortValue() { return (this.t==0)?this.s:(this.data[0]<<16)>>16; }
function bnpChunkSize(r) { return Math.floor(Math.LN2*this.DB/Math.log(r)); }
function bnSigNum() {
  if(this.s < 0) return -1;
  else if(this.t <= 0 || (this.t == 1 && this.data[0] <= 0)) return 0;
  else return 1;
}
function bnpToRadix(b) {
  if(b == null) b = 10;
  if(this.signum() == 0 || b < 2 || b > 36) return "0";
  var cs = this.chunkSize(b);
  var a = Math.pow(b,cs);
  var d = nbv(a), y = nbi(), z = nbi(), r = "";
  this.divRemTo(d,y,z);
  while(y.signum() > 0) {
    r = (a+z.intValue()).toString(b).substr(1) + r;
    y.divRemTo(d,y,z);
  }
  return z.intValue().toString(b) + r;
}
function bnpFromRadix(s,b) {
  this.fromInt(0);
  if(b == null) b = 10;
  var cs = this.chunkSize(b);
  var d = Math.pow(b,cs), mi = false, j = 0, w = 0;
  for(var i = 0; i < s.length; ++i) {
    var x = intAt(s,i);
    if(x < 0) {
      if(s.charAt(i) == "-" && this.signum() == 0) mi = true;
      continue;
    }
    w = b*w+x;
    if(++j >= cs) {
      this.dMultiply(d);
      this.dAddOffset(w,0);
      j = 0;
      w = 0;
    }
  }
  if(j > 0) {
    this.dMultiply(Math.pow(b,j));
    this.dAddOffset(w,0);
  }
  if(mi) BigInteger.ZERO.subTo(this,this);
}
function bnpFromNumber(a,b,c) {
  if("number" == typeof b) {
    if(a < 2) this.fromInt(1);
    else {
      this.fromNumber(a,c);
      if(!this.testBit(a-1))
        this.bitwiseTo(BigInteger.ONE.shiftLeft(a-1),op_or,this);
      if(this.isEven()) this.dAddOffset(1,0);
      while(!this.isProbablePrime(b)) {
        this.dAddOffset(2,0);
        if(this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a-1),this);
      }
    }
  }
  else {
    var x = new Array(), t = a&7;
    x.length = (a>>3)+1;
    b.nextBytes(x);
    if(t > 0) x[0] &= ((1<<t)-1); else x[0] = 0;
    this.fromString(x,256);
  }
}
function bnToByteArray() {
  var i = this.t, r = new Array();
  r[0] = this.s;
  var p = this.DB-(i*this.DB)%8, d, k = 0;
  if(i-- > 0) {
    if(p < this.DB && (d = this.data[i]>>p) != (this.s&this.DM)>>p)
      r[k++] = d|(this.s<<(this.DB-p));
    while(i >= 0) {
      if(p < 8) {
        d = (this.data[i]&((1<<p)-1))<<(8-p);
        d |= this.data[--i]>>(p+=this.DB-8);
      }
      else {
        d = (this.data[i]>>(p-=8))&0xff;
        if(p <= 0) { p += this.DB; --i; }
      }
      if((d&0x80) != 0) d |= -256;
      if(k == 0 && (this.s&0x80) != (d&0x80)) ++k;
      if(k > 0 || d != this.s) r[k++] = d;
    }
  }
  return r;
}
function bnEquals(a) { return(this.compareTo(a)==0); }
function bnMin(a) { return(this.compareTo(a)<0)?this:a; }
function bnMax(a) { return(this.compareTo(a)>0)?this:a; }
function bnpBitwiseTo(a,op,r) {
  var i, f, m = Math.min(a.t,this.t);
  for(i = 0; i < m; ++i) r.data[i] = op(this.data[i],a.data[i]);
  if(a.t < this.t) {
    f = a.s&this.DM;
    for(i = m; i < this.t; ++i) r.data[i] = op(this.data[i],f);
    r.t = this.t;
  }
  else {
    f = this.s&this.DM;
    for(i = m; i < a.t; ++i) r.data[i] = op(f,a.data[i]);
    r.t = a.t;
  }
  r.s = op(this.s,a.s);
  r.clamp();
}
function op_and(x,y) { return x&y; }
function bnAnd(a) { var r = nbi(); this.bitwiseTo(a,op_and,r); return r; }
function op_or(x,y) { return x|y; }
function bnOr(a) { var r = nbi(); this.bitwiseTo(a,op_or,r); return r; }
function op_xor(x,y) { return x^y; }
function bnXor(a) { var r = nbi(); this.bitwiseTo(a,op_xor,r); return r; }
function op_andnot(x,y) { return x&~y; }
function bnAndNot(a) { var r = nbi(); this.bitwiseTo(a,op_andnot,r); return r; }
function bnNot() {
  var r = nbi();
  for(var i = 0; i < this.t; ++i) r.data[i] = this.DM&~this.data[i];
  r.t = this.t;
  r.s = ~this.s;
  return r;
}
function bnShiftLeft(n) {
  var r = nbi();
  if(n < 0) this.rShiftTo(-n,r); else this.lShiftTo(n,r);
  return r;
}
function bnShiftRight(n) {
  var r = nbi();
  if(n < 0) this.lShiftTo(-n,r); else this.rShiftTo(n,r);
  return r;
}
function lbit(x) {
  if(x == 0) return -1;
  var r = 0;
  if((x&0xffff) == 0) { x >>= 16; r += 16; }
  if((x&0xff) == 0) { x >>= 8; r += 8; }
  if((x&0xf) == 0) { x >>= 4; r += 4; }
  if((x&3) == 0) { x >>= 2; r += 2; }
  if((x&1) == 0) ++r;
  return r;
}
function bnGetLowestSetBit() {
  for(var i = 0; i < this.t; ++i)
    if(this.data[i] != 0) return i*this.DB+lbit(this.data[i]);
  if(this.s < 0) return this.t*this.DB;
  return -1;
}
function cbit(x) {
  var r = 0;
  while(x != 0) { x &= x-1; ++r; }
  return r;
}
function bnBitCount() {
  var r = 0, x = this.s&this.DM;
  for(var i = 0; i < this.t; ++i) r += cbit(this.data[i]^x);
  return r;
}
function bnTestBit(n) {
  var j = Math.floor(n/this.DB);
  if(j >= this.t) return(this.s!=0);
  return((this.data[j]&(1<<(n%this.DB)))!=0);
}
function bnpChangeBit(n,op) {
  var r = BigInteger.ONE.shiftLeft(n);
  this.bitwiseTo(r,op,r);
  return r;
}
function bnSetBit(n) { return this.changeBit(n,op_or); }
function bnClearBit(n) { return this.changeBit(n,op_andnot); }
function bnFlipBit(n) { return this.changeBit(n,op_xor); }
function bnpAddTo(a,r) {
  var i = 0, c = 0, m = Math.min(a.t,this.t);
  while(i < m) {
    c += this.data[i]+a.data[i];
    r.data[i++] = c&this.DM;
    c >>= this.DB;
  }
  if(a.t < this.t) {
    c += a.s;
    while(i < this.t) {
      c += this.data[i];
      r.data[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += this.s;
  }
  else {
    c += this.s;
    while(i < a.t) {
      c += a.data[i];
      r.data[i++] = c&this.DM;
      c >>= this.DB;
    }
    c += a.s;
  }
  r.s = (c<0)?-1:0;
  if(c > 0) r.data[i++] = c;
  else if(c < -1) r.data[i++] = this.DV+c;
  r.t = i;
  r.clamp();
}
function bnAdd(a) { var r = nbi(); this.addTo(a,r); return r; }
function bnSubtract(a) { var r = nbi(); this.subTo(a,r); return r; }
function bnMultiply(a) { var r = nbi(); this.multiplyTo(a,r); return r; }
function bnSquare() { var r = nbi(); this.squareTo(r); return r; }
function bnDivide(a) { var r = nbi(); this.divRemTo(a,r,null); return r; }
function bnRemainder(a) { var r = nbi(); this.divRemTo(a,null,r); return r; }
function bnDivideAndRemainder(a) {
  var q = nbi(), r = nbi();
  this.divRemTo(a,q,r);
  return new Array(q,r);
}
function bnpDMultiply(n) {
  this.data[this.t] = this.am(0,n-1,this,0,0,this.t);
  ++this.t;
  this.clamp();
}
function bnpDAddOffset(n,w) {
  if(n == 0) return;
  while(this.t <= w) this.data[this.t++] = 0;
  this.data[w] += n;
  while(this.data[w] >= this.DV) {
    this.data[w] -= this.DV;
    if(++w >= this.t) this.data[this.t++] = 0;
    ++this.data[w];
  }
}
function NullExp() {}
function nNop(x) { return x; }
function nMulTo(x,y,r) { x.multiplyTo(y,r); }
function nSqrTo(x,r) { x.squareTo(r); }
NullExp.prototype.convert = nNop;
NullExp.prototype.revert = nNop;
NullExp.prototype.mulTo = nMulTo;
NullExp.prototype.sqrTo = nSqrTo;
function bnPow(e) { return this.exp(e,new NullExp()); }
function bnpMultiplyLowerTo(a,n,r) {
  var i = Math.min(this.t+a.t,n);
  r.s = 0;
  r.t = i;
  while(i > 0) r.data[--i] = 0;
  var j;
  for(j = r.t-this.t; i < j; ++i) r.data[i+this.t] = this.am(0,a.data[i],r,i,0,this.t);
  for(j = Math.min(a.t,n); i < j; ++i) this.am(0,a.data[i],r,i,0,n-i);
  r.clamp();
}
function bnpMultiplyUpperTo(a,n,r) {
  --n;
  var i = r.t = this.t+a.t-n;
  r.s = 0;
  while(--i >= 0) r.data[i] = 0;
  for(i = Math.max(n-this.t,0); i < a.t; ++i)
    r.data[this.t+i-n] = this.am(n-i,a.data[i],r,0,0,this.t+i-n);
  r.clamp();
  r.drShiftTo(1,r);
}
function Barrett(m) {
  this.r2 = nbi();
  this.q3 = nbi();
  BigInteger.ONE.dlShiftTo(2*m.t,this.r2);
  this.mu = this.r2.divide(m);
  this.m = m;
}
function barrettConvert(x) {
  if(x.s < 0 || x.t > 2*this.m.t) return x.mod(this.m);
  else if(x.compareTo(this.m) < 0) return x;
  else { var r = nbi(); x.copyTo(r); this.reduce(r); return r; }
}
function barrettRevert(x) { return x; }
function barrettReduce(x) {
  x.drShiftTo(this.m.t-1,this.r2);
  if(x.t > this.m.t+1) { x.t = this.m.t+1; x.clamp(); }
  this.mu.multiplyUpperTo(this.r2,this.m.t+1,this.q3);
  this.m.multiplyLowerTo(this.q3,this.m.t+1,this.r2);
  while(x.compareTo(this.r2) < 0) x.dAddOffset(1,this.m.t+1);
  x.subTo(this.r2,x);
  while(x.compareTo(this.m) >= 0) x.subTo(this.m,x);
}
function barrettSqrTo(x,r) { x.squareTo(r); this.reduce(r); }
function barrettMulTo(x,y,r) { x.multiplyTo(y,r); this.reduce(r); }
Barrett.prototype.convert = barrettConvert;
Barrett.prototype.revert = barrettRevert;
Barrett.prototype.reduce = barrettReduce;
Barrett.prototype.mulTo = barrettMulTo;
Barrett.prototype.sqrTo = barrettSqrTo;
function bnModPow(e,m) {
  var i = e.bitLength(), k, r = nbv(1), z;
  if(i <= 0) return r;
  else if(i < 18) k = 1;
  else if(i < 48) k = 3;
  else if(i < 144) k = 4;
  else if(i < 768) k = 5;
  else k = 6;
  if(i < 8)
    z = new Classic(m);
  else if(m.isEven())
    z = new Barrett(m);
  else
    z = new Montgomery(m);
  var g = new Array(), n = 3, k1 = k-1, km = (1<<k)-1;
  g[1] = z.convert(this);
  if(k > 1) {
    var g2 = nbi();
    z.sqrTo(g[1],g2);
    while(n <= km) {
      g[n] = nbi();
      z.mulTo(g2,g[n-2],g[n]);
      n += 2;
    }
  }
  var j = e.t-1, w, is1 = true, r2 = nbi(), t;
  i = nbits(e.data[j])-1;
  while(j >= 0) {
    if(i >= k1) w = (e.data[j]>>(i-k1))&km;
    else {
      w = (e.data[j]&((1<<(i+1))-1))<<(k1-i);
      if(j > 0) w |= e.data[j-1]>>(this.DB+i-k1);
    }
    n = k;
    while((w&1) == 0) { w >>= 1; --n; }
    if((i -= n) < 0) { i += this.DB; --j; }
    if(is1) {
      g[w].copyTo(r);
      is1 = false;
    }
    else {
      while(n > 1) { z.sqrTo(r,r2); z.sqrTo(r2,r); n -= 2; }
      if(n > 0) z.sqrTo(r,r2); else { t = r; r = r2; r2 = t; }
      z.mulTo(r2,g[w],r);
    }
    while(j >= 0 && (e.data[j]&(1<<i)) == 0) {
      z.sqrTo(r,r2); t = r; r = r2; r2 = t;
      if(--i < 0) { i = this.DB-1; --j; }
    }
  }
  return z.revert(r);
}
function bnGCD(a) {
  var x = (this.s<0)?this.negate():this.clone();
  var y = (a.s<0)?a.negate():a.clone();
  if(x.compareTo(y) < 0) { var t = x; x = y; y = t; }
  var i = x.getLowestSetBit(), g = y.getLowestSetBit();
  if(g < 0) return x;
  if(i < g) g = i;
  if(g > 0) {
    x.rShiftTo(g,x);
    y.rShiftTo(g,y);
  }
  while(x.signum() > 0) {
    if((i = x.getLowestSetBit()) > 0) x.rShiftTo(i,x);
    if((i = y.getLowestSetBit()) > 0) y.rShiftTo(i,y);
    if(x.compareTo(y) >= 0) {
      x.subTo(y,x);
      x.rShiftTo(1,x);
    }
    else {
      y.subTo(x,y);
      y.rShiftTo(1,y);
    }
  }
  if(g > 0) y.lShiftTo(g,y);
  return y;
}
function bnpModInt(n) {
  if(n <= 0) return 0;
  var d = this.DV%n, r = (this.s<0)?n-1:0;
  if(this.t > 0)
    if(d == 0) r = this.data[0]%n;
    else for(var i = this.t-1; i >= 0; --i) r = (d*r+this.data[i])%n;
  return r;
}
function bnModInverse(m) {
  var ac = m.isEven();
  if((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
  var u = m.clone(), v = this.clone();
  var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
  while(u.signum() != 0) {
    while(u.isEven()) {
      u.rShiftTo(1,u);
      if(ac) {
        if(!a.isEven() || !b.isEven()) { a.addTo(this,a); b.subTo(m,b); }
        a.rShiftTo(1,a);
      }
      else if(!b.isEven()) b.subTo(m,b);
      b.rShiftTo(1,b);
    }
    while(v.isEven()) {
      v.rShiftTo(1,v);
      if(ac) {
        if(!c.isEven() || !d.isEven()) { c.addTo(this,c); d.subTo(m,d); }
        c.rShiftTo(1,c);
      }
      else if(!d.isEven()) d.subTo(m,d);
      d.rShiftTo(1,d);
    }
    if(u.compareTo(v) >= 0) {
      u.subTo(v,u);
      if(ac) a.subTo(c,a);
      b.subTo(d,b);
    }
    else {
      v.subTo(u,v);
      if(ac) c.subTo(a,c);
      d.subTo(b,d);
    }
  }
  if(v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
  if(d.compareTo(m) >= 0) return d.subtract(m);
  if(d.signum() < 0) d.addTo(m,d); else return d;
  if(d.signum() < 0) return d.add(m); else return d;
}
var lowprimes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,307,311,313,317,331,337,347,349,353,359,367,373,379,383,389,397,401,409,419,421,431,433,439,443,449,457,461,463,467,479,487,491,499,503,509,521,523,541,547,557,563,569,571,577,587,593,599,601,607,613,617,619,631,641,643,647,653,659,661,673,677,683,691,701,709,719,727,733,739,743,751,757,761,769,773,787,797,809,811,821,823,827,829,839,853,857,859,863,877,881,883,887,907,911,919,929,937,941,947,953,967,971,977,983,991,997];
var lplim = (1<<26)/lowprimes[lowprimes.length-1];
function bnIsProbablePrime(t) {
  var i, x = this.abs();
  if(x.t == 1 && x.data[0] <= lowprimes[lowprimes.length-1]) {
    for(i = 0; i < lowprimes.length; ++i)
      if(x.data[0] == lowprimes[i]) return true;
    return false;
  }
  if(x.isEven()) return false;
  i = 1;
  while(i < lowprimes.length) {
    var m = lowprimes[i], j = i+1;
    while(j < lowprimes.length && m < lplim) m *= lowprimes[j++];
    m = x.modInt(m);
    while(i < j) if(m%lowprimes[i++] == 0) return false;
  }
  return x.millerRabin(t);
}
function bnpMillerRabin(t) {
  var n1 = this.subtract(BigInteger.ONE);
  var k = n1.getLowestSetBit();
  if(k <= 0) return false;
  var r = n1.shiftRight(k);
  t = (t+1)>>1;
  if(t > lowprimes.length) t = lowprimes.length;
  var a = nbi();
  for(var i = 0; i < t; ++i) {
    a.fromInt(lowprimes[Math.floor(Math.random()*lowprimes.length)]);
    var y = a.modPow(r,this);
    if(y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
      var j = 1;
      while(j++ < k && y.compareTo(n1) != 0) {
        y = y.modPowInt(2,this);
        if(y.compareTo(BigInteger.ONE) == 0) return false;
      }
      if(y.compareTo(n1) != 0) return false;
    }
  }
  return true;
}
BigInteger.prototype.chunkSize = bnpChunkSize;
BigInteger.prototype.toRadix = bnpToRadix;
BigInteger.prototype.fromRadix = bnpFromRadix;
BigInteger.prototype.fromNumber = bnpFromNumber;
BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
BigInteger.prototype.changeBit = bnpChangeBit;
BigInteger.prototype.addTo = bnpAddTo;
BigInteger.prototype.dMultiply = bnpDMultiply;
BigInteger.prototype.dAddOffset = bnpDAddOffset;
BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
BigInteger.prototype.modInt = bnpModInt;
BigInteger.prototype.millerRabin = bnpMillerRabin;
BigInteger.prototype.clone = bnClone;
BigInteger.prototype.intValue = bnIntValue;
BigInteger.prototype.byteValue = bnByteValue;
BigInteger.prototype.shortValue = bnShortValue;
BigInteger.prototype.signum = bnSigNum;
BigInteger.prototype.toByteArray = bnToByteArray;
BigInteger.prototype.equals = bnEquals;
BigInteger.prototype.min = bnMin;
BigInteger.prototype.max = bnMax;
BigInteger.prototype.and = bnAnd;
BigInteger.prototype.or = bnOr;
BigInteger.prototype.xor = bnXor;
BigInteger.prototype.andNot = bnAndNot;
BigInteger.prototype.not = bnNot;
BigInteger.prototype.shiftLeft = bnShiftLeft;
BigInteger.prototype.shiftRight = bnShiftRight;
BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
BigInteger.prototype.bitCount = bnBitCount;
BigInteger.prototype.testBit = bnTestBit;
BigInteger.prototype.setBit = bnSetBit;
BigInteger.prototype.clearBit = bnClearBit;
BigInteger.prototype.flipBit = bnFlipBit;
BigInteger.prototype.add = bnAdd;
BigInteger.prototype.subtract = bnSubtract;
BigInteger.prototype.multiply = bnMultiply;
BigInteger.prototype.divide = bnDivide;
BigInteger.prototype.remainder = bnRemainder;
BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
BigInteger.prototype.modPow = bnModPow;
BigInteger.prototype.modInverse = bnModInverse;
BigInteger.prototype.pow = bnPow;
BigInteger.prototype.gcd = bnGCD;
BigInteger.prototype.isProbablePrime = bnIsProbablePrime;
BigInteger.prototype.square = bnSquare;

function h$sti(f) {
  h$initStatic.push(function() {
    var xs = f();
    var to = xs.shift();
    h$init_closure(to, xs);
  });
}
function h$initInfoTables(n, funcs, info) {
  var pos = 0;
  function code(c) {
    if(c < 34) return c - 32;
    if(c < 92) return c - 33;
    return c - 34;
  }
  function next() {
    var c = info.charCodeAt(pos);
    if(c < 124) {
      pos++;
      return code(c);
    }
    if(c === 124) {
      pos+=3;
      return 90 + 90 * code(info.charCodeAt(pos-2))
                + code(info.charCodeAt(pos-1));
    }
    if(c === 125) {
      pos+=4;
      return 8190 + 8100 * code(info.charCodeAt(pos-3))
                  + 90 * code(info.charCodeAt(pos-2))
                  + code(info.charCodeAt(pos-1));
    }
    throw "h$initInfoTables: invalid code in info table"
  }
  for(var i=0;i<n;i++) {
    var o = funcs[i];
    var ot;
    var oa = 0;
    var oregs = 256;
    switch(next()) {
      case 0:
        ot = 0;
        break;
      case 1:
        ot = 1
        var arity = next();
        var skipRegs = next();
        var skip = skipRegs & 1;
        var regs = skipRegs >>> 1;
        oregs = (regs << 8) | skip;
        oa = arity + ((regs-1+skip) << 8);
        break;
      case 2:
        ot = 2;
        oa = next();
        break;
      case 3:
        ot = -1;
        oa = 0;
        oregs = next();
        oregs = ((oregs >>> 1) << 8) | (oregs & 1);
        break;
      default: throw ("h$initInfoTables: invalid closure type: " + 3)
    }
    var size = next() - 1;
    var nsrts = next();
    var srt = null;
    if(nsrts > 0) {
      srt = [];
      for(var j=0;j<nsrts;j++) {
        srt.push(funcs[next()]);
      }
    }
    o.t = ot;
    o.i = [];
    o.n = "";
    o.a = oa;
    o.r = oregs;
    o.s = srt;
    o.m = 0;
    o.size = size;
  }
}
function h$sliceArray(a, start, n) {
  return a.slice(start, n);
}
function h$memcpy() {
  if(arguments.length === 3) {
    var dst = arguments[0];
    var src = arguments[1];
    var n = arguments[2];
    for(var i=n-1;i>=0;i--) {
      dst.u8[i] = src.u8[i];
    }
    ret1 = 0;
    return dst;
  } else if(arguments.length === 5) {
    var dst = arguments[0];
    var dst_off = arguments[1]
    var src = arguments[2];
    var src_off = arguments[3];
    var n = arguments[4];
    for(var i=n-1;i>=0;i--) {
      dst.u8[i+dst_off] = src.u8[i+src_off];
    }
    ret1 = dst_off;
    return dst;
  } else {
    throw "h$memcpy: unexpected argument";
  }
}
function h$memchr(a_v, a_o, c, n) {
  for(var i=0;i<n;i++) {
    if(a_v.u8[a_o+i] === c) {
      h$ret1 = a_o+i;
      return a_v;
    }
  }
  h$ret1 = 0;
  return null;
}
function h$strlen(a_v, a_o) {
  var i=0;
  while(true) {
    if(a_v.u8[a_o+i] === 0) { return i; }
    i++;
  }
}
function h$fps_reverse(a_v, a_o, b_v, b_o, n) {
  for(var i=0;i<n;i++) {
    a_v.u8[a_o+n-i-1] = b_v.u8[b_o+i];
  }
}
function h$fps_intersperse(a_v,a_o,b_v,b_o,n,c) {
  var dst_o = a_o;
  for(var i=0;i<n-1;i++) {
    a_v.u8[dst_o] = b_v.u8[b_o+i];
    a_v.u8[dst_o+1] = c;
    dst_o += 2;
  }
  if(n > 0) {
    a_v.u8[dst_o] = v_c.u8[b_o+n-1];
  }
}
function h$fps_maximum(a_v,a_o,n) {
  var max = a_v.u8[a_o];
  for(var i=1;i<n;i++) {
    var c = a_v.u8[a_o+i];
    if(c > max) { max = c; }
  }
  return max;
}
function h$fps_minimum(a_v,a_o,n) {
  var min = a_v.u8[a_o];
  for(var i=1;i<n;i++) {
    var c = a_v.u8[a_o+i];
    if(c < min) { min = c; }
  }
  return min;
}
function h$fps_count(a_v,a_o,n,c) {
  var count = 0;
  for(var i=0;i<n;i++) {
    if(a_v.u8[a_o+i] === c) { count++; }
  }
  return count|0;
}
function h$newArray(len,e) {
  var r = [];
  for(var i=0;i<len;i++) { r[i] = e; }
  return r;
}
function h$roundUpToMultipleOf(n,m) {
  var rem = n % m;
  return rem === 0 ? n : n - rem + m;
}
function h$newByteArray(len) {
  var len0 = Math.max(h$roundUpToMultipleOf(len, 8), 8);
  var buf = new ArrayBuffer(len0);
  return { buf: buf
         , len: len
         , i3: new Int32Array(buf)
         , u8: new Uint8Array(buf)
         , u1: new Uint16Array(buf)
         , f3: new Float32Array(buf)
         , f6: new Float64Array(buf)
         , dv: new DataView(buf)
         }
}
function h$wrapBuffer(buf, unalignedOk, offset, length) {
  if(!unalignedOk && offset && offset % 8 !== 0) {
    throw ("h$wrapBuffer: offset not aligned:" + offset);
  }
  if(!buf || !(buf instanceof ArrayBuffer))
    throw "h$wrapBuffer: not an ArrayBuffer"
  if(!offset) { offset = 0; }
  if(!length || length < 0) { length = buf.byteLength - offset; }
  return { buf: buf
         , len: length
         , i3: (offset%4) ? null : new Int32Array(buf, offset, length >> 2)
         , u8: new Uint8Array(buf, offset, length)
         , u1: (offset%2) ? null : new Uint16Array(buf, offset, length >> 1)
         , f3: (offset%4) ? null : new Float32Array(buf, offset, length >> 2)
         , f6: (offset%8) ? null : new Float64Array(buf, offset, length >> 3)
         , dv: new DataView(buf, offset, length)
         };
}
h$stableNameN = 1;
function h$getObjectKey(o) {
  var x = o.m;
  if(o.m >> 18 === 0) {
    o.m |= ++h$stableNameN << 18;
  }
  return o.m >> 18;
}
function h$getObjectHash(o) {
  if(o === null) {
    return 230948;
  } if(typeof o === 'number') {
    return o|0;
  } else if(typeof o === 'object' && o.hasOwnProperty('m') && typeof o.m === 'number') {
    return h$getObjectKey(o);
  } else {
    return 3456333333;
  }
}
function h$makeStableName(x) {
  if(typeof x === 'object') {
    return [x,x.f];
  } else {
    return [x,null];
  }
}
function h$stableNameInt(s) {
  var s0 = s[0];
  if(typeof s0 === 'boolean') { return s0?1:0; }
  if(typeof s0 === 'number') { return s0|0; }
  var hash = 23;
  hash = (hash * 37 + h$getObjectKey(s0))|0;
  hash = (hash * 37 + h$getObjectHash(s0.d1))|0;
  hash = (hash * 37 + h$getObjectHash(s0.d2))|0;
  return hash;
}
function h$eqStableName(s1o,s2o) {
  var s1 = s1o[0];
  var s2 = s2o[0];
  if(typeof s1 !== 'object' || typeof s2 !== 'object') {
    return s1 === s2 ? 1 : 0;
  }
  var s1f = s1o[1];
  var s2f = s2o[1];
  return (s1f === s2f && (s1 === s2 || (s1.f === s2.f && s1.d1 === s2.d1 && s1.d2 === s2.d2)))?1:0;
}
function h$makeStablePtr(v) {
  var buf = h$newByteArray(4);
  buf.arr = [v];
  h$ret1 = 0;
  return buf;
}
function h$hs_free_stable_ptr(stable) {
}
function h$malloc(n) {
  h$ret1 = 0;
  return h$newByteArray(n);
}
function h$free() {
}
function h$memset() {
  var buf_v, buf_off, chr, n;
  buf_v = arguments[0];
  if(arguments.length == 4) {
    buf_off = arguments[1];
    chr = arguments[2];
    n = arguments[3];
  } else if(arguments.length == 3) {
    buf_off = 0;
    chr = arguments[1];
    n = arguments[2];
  } else {
    throw("h$memset: unexpected argument")
  }
  var end = buf_off + n;
  for(var i=buf_off;i<end;i++) {
    buf_v.u8[i] = chr;
  }
  ret1 = buf_off;
  return buf_v;
}
function h$memcmp(a_v, a_o, b_v, b_o, n) {
  for(var i=0;i<n;i++) {
    var a = a_v.u8[a_o+i];
    var b = b_v.u8[b_o+i];
    var c = a-b;
    if(c !== 0) { return c; }
  }
  return 0;
}
function h$memmove(a_v, a_o, b_v, b_o, n) {
  if(n > 0) {
    var tmp = new Uint8Array(b_v.buf.slice(b_o,b_o+n));
    for(var i=0;i<n;i++) {
      a_v.u8[a_o+i] = tmp[i];
    }
  }
  h$ret1 = a_o;
  return a_v;
}
function h$mkPtr(v, o) {
  return h$c2(h$baseZCGHCziPtrziPtr_con_e, v, o);
};
function h$mkFunctionPtr(f) {
  var d = h$newByteArray(4);
  d.arr = [f];
  return d;
}
h$freeHaskellFunctionPtr = function () {
}
function h$createAdjustor(cconv, hptr, hptr_2, wptr, wptr_2, type) {
    h$ret1 = hptr_2;
    return hptr;
};
var h$extraRoots = new goog.structs.Set();
var h$domRoots = new goog.structs.Set();
function h$makeCallback(retain, f, extraArgs, action) {
  var args = extraArgs.slice(0);
  args.unshift(action);
  var c = function() {
    return f.apply(this, args);
  }
  if(retain) {
    c.root = action;
    h$extraRoots.add(c);
  }
  return c;
}
function h$makeCallbackApply(retain, n, f, extraArgs, fun) {
  var c;
  if(n === 1) {
    c = function(x) {
      var args = extraArgs.slice(0);
      var action = h$c2(h$ap1_e, fun, h$mkJSRef(x));
      args.unshift(action);
      return f.apply(this, args);
    }
  } else if (n === 2) {
    c = function(x,y) {
      var args = extraArgs.slice(0);
      var action = h$c3(h$ap2_e, fun, h$mkJSRef(x), h$mkJSRef(y));
      args.unshift(action);
      return f.apply(this, args);
    }
  } else {
    throw "h$makeCallbackApply: unsupported arity";
  }
  if(retain === true) {
    c.root = fun;
    h$extraRoots.add(c);
  } else if(retain) {
  } else {
  }
  return c;
}
function h$mkJSRef(x) {
  return h$c1(h$ghcjszmprimZCGHCJSziPrimziJSRef_con_e, x);
}
function h$retain(c) {
  h$extraRoots.add(c);
}
function h$retainDom(d, c) {
  h$domRoots.add(c);
  c.domRoots = new goog.structs.Set();
}
function h$releasePermanent(c) {
  h$extraRoots.remove(c);
}
function h$release(c) {
  h$extraRoots.remove(c);
  h$domRoots.remove(c);
}
function h$releaseDom(c,d) {
  if(c.domRoots) c.domRoots.remove(d);
  if(!c.domRoots || c.domRoots.size() == 0) h$domRoots.remove(c);
}
function h$isInstanceOf(o,c) {
  return o instanceof c;
}
function h$getpagesize() {
  return 4096;
}
var h$MAP_ANONYMOUS = 0x20;
function h$mmap(addr_d, addr_o, len, prot, flags, fd, offset1, offset2) {
  if(flags & h$MAP_ANONYMOUS || fd === -1) {
    h$ret1 = 0;
    return h$newByteArray(len);
  } else {
    throw "h$mmap: mapping a file is not yet supported";
  }
}
function h$mprotect(addr_d, addr_o, size, prot) {
  return 0;
}
function h$munmap(addr_d, addr_o, size) {
  if(addr_d && addr_o === 0 && size >= addr_d.len) {
    addr_d.buf = null;
    addr_d.i3 = null;
    addr_d.u8 = null;
    addr_d.u1 = null;
    addr_d.f3 = null;
    addr_d.f6 = null;
    addr_d.dv = null;
  }
  return 0;
}

var h$gcMark = 2;
var h$retainCAFs = false;
var h$CAFs = [];
var h$CAFsReset = [];
function h$isMarked(obj) {
  return (typeof obj === 'object' || typeof obj === 'function') &&
         typeof obj.m === 'number' && (obj.m & 3) === h$gcMark;
}
function h$gcQuick(t) {
  if(h$currentThread !== null) throw "h$gcQuick: GC can only be run when no thread is running";
  h$resetRegisters();
  h$resetResultVars();
  var i;
  if(t !== null) {
    if(t instanceof h$Thread) {
      h$resetThread(t);
    } else {
      for(var i=0;i<t.length;i++) h$resetThread(t[i]);
    }
  } else {
    var runnable = h$threads.getValues();
    for(i=0;i<runnable.length;i++) {
      h$resetThread(runnable[i]);
    }
    var iter = h$blocked.__iterator__();
    try {
      while(true) h$resetThread(iter.next());
    } catch(e) { if(e !== goog.iter.StopIteration) throw e; }
  }
}
function h$gc(t) {
  if(h$currentThread !== null) throw "h$gc: GC can only be run when no thread is running";
  var start = Date.now();
  h$resetRegisters();
  h$resetResultVars();
  h$gcMark = 5-h$gcMark;
  var i;
  var runnable = h$threads.getValues();
  if(t !== null) h$markThread(t);
  for(i=0;i<runnable.length;i++) h$markThread(runnable[i]);
  var iter = h$blocked.__iterator__();
  try {
    while(true) {
      var nt = iter.next();
      if(!(nt.blockedOn instanceof h$MVar)) {
        h$markThread(nt);
      }
    }
  } catch(e) { if(e !== goog.iter.StopIteration) throw e; }
  iter = h$extraRoots.__iterator__();
  try {
    while(true) h$follow(iter.next().root);
  } catch(e) { if(e !== goog.iter.StopIteration) throw e; }
  h$markRetained();
  var killedThread;
  while(killedThread = h$finalizeMVars()) {
    h$markThread(killedThread);
    h$markRetained();
  }
  iter = h$blocked.__iterator__();
  try {
    while(true) h$markThread(iter.next());
  } catch(e) { if(e !== goog.iter.StopIteration) throw e; }
  h$markRetained();
  h$finalizeDom();
  h$finalizeWeaks();
  h$finalizeCAFs();
  var now = Date.now();
  h$lastGc = now;
}
function h$markRetained() {
  var marked;
  do {
    marked = false;
    iter = h$weaks.__iterator__();
    try {
      while(true) {
        ;
        c = iter.next();
        if(h$isMarked(c.key) && !h$isMarked(c.val)) {
          ;
          h$follow(c.val);
          marked = true;
        }
        if(c.finalizer && !h$isMarked(c.finalizer)) {
          ;
          h$follow(c.finalizer);
          marked = true;
        }
      }
    } catch (e) { if(e !== goog.iter.StopIteration) throw e; }
    iter = h$domRoots.__iterator__();
    try {
      while(true) {
        c = iter.next();
        if(!h$isMarked(c.root) && c.domRoots && c.domRoots.size() > 0) {
          var domRetainers = c.domRoots.__iterator__();
          try {
            while(true) {
              if(h$isReachableDom(c.next())) {
                ;
                h$follow(c.root);
                marked = true;
                break;
              }
            }
          } catch(e) { if(e !== goog.iter.StopIteration) throw e; }
        }
      }
    } catch (e) { if(e !== goog.iter.StopIteration) throw e; }
  } while(marked);
}
function h$markThread(t) {
  if(t.m === h$gcMark) return;
  t.m = h$gcMark;
  if(t.stack === null) return;
  h$follow(t.stack, t.sp);
  h$resetThread(t);
}
function h$followObjGen(c, work) {
   work.push(c.d1);
   var d = c.d2;
   for(var x in d) {
     work.push(d[x]);
   }
}
function h$follow(obj, sp) {
  var i, iter, c, work;
  var mark = h$gcMark;
  var work;
  if(typeof sp === 'number') {
    work = obj.slice(0, sp+1);
  } else {
    work = [obj];
  }
  while(work.length > 0) {
    ;
    c = work.pop();
    ;
    if(c !== null && typeof c === 'object' && (c.m === undefined || (c.m&3) !== mark)) {
      var doMark = false;
      var cf = c.f;
      if(typeof cf === 'function' && typeof c.m === 'number') {
        ;
        c.m = (c.m&-4)|mark;
        var d = c.d2;
        switch(cf.size) {
          case 0: break;
          case 1: work.push(c.d1); break;
          case 2: work.push(c.d1, d); break;
          case 3: var d3=c.d2; work.push(c.d1, d3.d1, d3.d2); break;
          case 4: var d4=c.d2; work.push(c.d1, d4.d1, d4.d2, d4.d3); break;
          case 5: var d5=c.d2; work.push(c.d1, d5.d1, d5.d2, d5.d3, d5.d4); break;
          case 6: var d6=c.d2; work.push(c.d1, d6.d1, d6.d2, d6.d3, d6.d4, d6.d5); break;
          case 7: var d7=c.d2; work.push(c.d1, d7.d1, d7.d2, d7.d3, d7.d4, d7.d5, d7.d6); break;
          case 8: var d8=c.d2; work.push(c.d1, d8.d1, d8.d2, d8.d3, d8.d4, d8.d5, d8.d6, d8.d7); break;
          case 9: var d9=c.d2; work.push(c.d1, d9.d1, d9.d2, d9.d3, d9.d4, d9.d5, d9.d6, d9.d7, d9.d8); break;
          case 10: var d10=c.d2; work.push(c.d1, d10.d1, d10.d2, d10.d3, d10.d4, d10.d5, d10.d6, d10.d7, d10.d8, d10.d9); break;
          case 11: var d11=c.d2; work.push(c.d1, d11.d1, d11.d2, d11.d3, d11.d4, d11.d5, d11.d6, d11.d7, d11.d8, d11.d9, d11.d10); break;
          case 12: var d12=c.d2; work.push(c.d1, d12.d1, d12.d2, d12.d3, d12.d4, d12.d5, d12.d6, d12.d7, d12.d8, d12.d9, d12.d10, d12.d11); break;
          default: h$followObjGen(c,work);
        }
        var s = cf.s;
        if(s !== null) {
          ;
          for(var i=0;i<s.length;i++) work.push(s[i]);
        }
      } else if(c instanceof h$Weak) {
        ;
        c.m = mark;
      } else if(c instanceof h$MVar) {
        ;
        c.m = mark;
        iter = c.writers.getValues();
        for(i=0;i<iter.length;i++) {
          work.push(iter[i][1]);
        }
        if(c.val !== null) { work.push(c.val); }
      } else if(c instanceof h$MutVar) {
        ;
        c.m = mark;
        work.push(c.val);
      } else if(c instanceof h$TVar) {
        ;
        c.m = mark;
        work.push(c.val);
      } else if(c instanceof h$Thread) {
        ;
        if(c.m !== mark) {
          c.m = mark;
          if(c.stack) work.push.apply(work, c.stack.slice(0, c.sp));
        }
      } else if(c instanceof h$Transaction) {
        ;
        c.m = mark;
        work.push.apply(work, c.invariants);
        work.push(c.action);
        iter = c.tvars.__iterator__();
        try {
          while(true) work.push(c.next());
        } catch(e) { if(e !== goog.iter.StopIteration) throw e; }
      } else if(c instanceof Array) {
        ;
        if(((typeof c.m === 'number' && c.m !== mark) || typeof c.m === 'undefined') &&
           (c.length === 0 || (typeof c[0] === 'object' && typeof c[0].f === 'function' && typeof c[0].m === 'number'))) {
          c.m = mark;
          for(i=0;i<c.length;i++) {
            var x = c[i];
            if(x && typeof x === 'object' && typeof x.f === 'function' && typeof x.m === 'number') {
              if(x.m !== mark) work.push(x);
            } else {
              break;
            }
          }
        }
      } else {
      }
    }
  }
  ;
}
function h$resetThread(t) {
  var stack = t.stack;
  var sp = t.sp;
  if(stack.length - sp > sp && stack.length > 100) {
    t.stack = t.stack.slice(0,sp+1);
  } else {
    for(var i=sp+1;i<stack.length;i++) {
      stack[i] = null;
    }
  }
  ;
}
function h$finalizeMVars() {
  ;
  var i, iter = h$blocked.__iterator__();
  try {
    while(true) {
      var t = iter.next();
      if(t.status === h$threadBlocked && t.blockedOn instanceof h$MVar) {
        if(t.blockedOn.m !== h$gcMark && t.stack[t.sp] !== h$unboxFFIResult) {
          h$killThread(t, h$ghcjszmprimZCGHCJSziPrimziInternalziblockedIndefinitelyOnMVar);
          return t;
        }
      }
    }
  } catch(e) { if(e !== goog.iter.StopIteration) throw e; }
  return null;
}
function h$finalizeDom() {
}
function h$finalizeCAFs() {
  if(h$retainCAFs) return;
  var mark = h$gcMark;
  for(var i=0;i<h$CAFs.length;i++) {
    var c = h$CAFs[i];
    if(c.m & 3 !== mark) {
      var cr = h$CAFsReset[i];
      if(c.f !== cr) {
        ;
        c.f = cr;
        c.d1 = null;
        c.d2 = null;
      }
    }
  }
  ;
}

var h$E2BIG = 7;
var h$EBADF = 9;
var h$EACCES = 13;
var h$EINVAL = 22;
var h$EILSEQ = 92;
var h$errno = 0;
function h$__hscore_get_errno() {
  return h$errno;
}
function h$strerror(err) {
  ret1 = 0;
  if(err === h$E2BIG) {
    return h$encodeUtf8("too big");
  } else if(err === h$EACCES) {
    return h$encodeUtf8("no access");
  } else if(err === h$EINVAL) {
    return h$encodeUtf8("invalid");
  } else if(err === h$EBADF) {
    return h$encodeUtf8("invalid file descriptor");
  } else {
    return h$encodeUtf8("unknown error");
  }
}

function h$MD5Init(ctx, ctx_off) {
  if(!ctx.arr) { ctx.arr = []; }
  ctx.arr[ctx_off] = new goog.crypt.Md5();
}
var h$__hsbase_MD5Init = h$MD5Init;
function h$MD5Update(ctx, ctx_off, data, data_off, len) {
  var arr = new Uint8Array(data.buf, data_off);
  ctx.arr[ctx_off].update(arr, len);
}
var h$__hsbase_MD5Update = h$MD5Update;
function h$MD5Final(dst, dst_off, ctx, ctx_off) {
  var digest = ctx.arr[ctx_off].digest();
  for(var i=0;i<16;i++) {
    dst.u8[dst_off+i] = digest[i];
  }
}
var h$__hsbase_MD5Final = h$MD5Final;

function h$hs_eqWord64(a1,a2,b1,b2) {
  return (a1===b1 && a2===b2) ? 1 : 0;
}
function h$hs_neWord64(a1,a2,b1,b2) {
  return (a1 !== b1 || a2 !== b2) ? 1 : 0;
}
function h$hs_word64ToWord(a1,a2) {
  return a2;
}
function h$hs_wordToWord64(w) {
  h$ret1 = w;
  return 0;
}
function h$hs_intToInt64(a) {
  h$ret1 = a;
  return (a < 0) ? -1 : 0;
}
function h$hs_int64ToWord64(a1,a2) {
  h$ret1 = a2;
  return a1;
}
function h$hs_word64ToInt64(a1,a2) {
  h$ret1 = a2;
  return a1;
}
function h$hs_int64ToInt(a1,a2) {
  return (a1 < 0) ? (a2 | 0x80000000) : (a2 & 0x7FFFFFFF);
}
function h$hs_negateInt64(a1,a2) {
  var c = goog.math.Long.fromBits(a2,a1).negate();
  h$ret1 = c.getLowBits();
  return c.getHighBits();
}
function h$hs_not64(a1,a2) {
  h$ret1 = ~a2;
  return ~a1;
}
function h$hs_xor64(a1,a2,b1,b2) {
  h$ret1 = a2 ^ b2;
  return a1 ^ b1;
}
function h$hs_and64(a1,a2,b1,b2) {
  h$ret1 = a2 & b2;
  return a1 & b1;
}
function h$hs_or64(a1,a2,b1,b2) {
  h$ret1 = a2 | b2;
  return a1 | b1;
}
function h$hs_eqInt64(a1,a2,b1,b2) {
  return (a1 === b1 && a2 === b2) ? 1 : 0;
}
function h$hs_neInt64(a1,a2,b1,b2) {
  return (a1 !== b1 || a2 !== b2) ? 1 : 0;
}
function h$hs_leInt64(a1,a2,b1,b2) {
  if(a1 === b1) {
    var a2s = a2 >>> 1;
    var b2s = b2 >>> 1;
    return (a2s < b2s || (a2s === b2s && ((a2&1) <= (b2&1)))) ? 1 : 0;
  } else {
    return (a1 < b1) ? 1 : 0;
  }
}
function h$hs_ltInt64(a1,a2,b1,b2) {
  if(a1 === b1) {
    var a2s = a2 >>> 1;
    var b2s = b2 >>> 1;
    return (a2s < b2s || (a2s === b2s && ((a2&1) < (b2&1)))) ? 1 : 0;
  } else {
    return (a1 < b1) ? 1 : 0;
  }
}
function h$hs_geInt64(a1,a2,b1,b2) {
  if(a1 === b1) {
    var a2s = a2 >>> 1;
    var b2s = b2 >>> 1;
    return (a2s > b2s || (a2s === b2s && ((a2&1) >= (b2&1)))) ? 1 : 0;
  } else {
    return (a1 > b1) ? 1 : 0;
  }
}
function h$hs_gtInt64(a1,a2,b1,b2) {
  if(a1 === b1) {
    var a2s = a2 >>> 1;
    var b2s = b2 >>> 1;
    return (a2s > b2s || (a2s === b2s && ((a2&1) > (b2&1)))) ? 1 : 0;
  } else {
    return (a1 > b1) ? 1 : 0;
  }
}
function h$hs_quotWord64(a1,a2,b1,b2) {
  var a = h$bigFromWord64(a1,a2);
  var b = h$bigFromWord64(b1,b2);
  var c = a.divide(b);
  h$ret1 = c.intValue();
  return c.shiftRight(32).intValue();
}
function h$hs_timesInt64(a1,a2,b1,b2) {
  var c = goog.math.Long.fromBits(a2,a1).multiply(goog.math.Long.fromBits(b2,b1));
  h$ret1 = c.getLowBits();
  return c.getHighBits();
}
function h$hs_quotInt64(a1,a2,b1,b2) {
  var c = goog.math.Long.fromBits(a2,a1).div(goog.math.Long.fromBits(b2,b1));
  h$ret1 = c.getLowBits();
  return c.getHighBits();
}
function h$hs_remInt64(a1,a2,b1,b2) {
  var c = goog.math.Long.fromBits(a2,a1).modulo(goog.math.Long.fromBits(b2,b1));
  h$ret1 = c.getLowBits();
  return c.getHighBits();
}
function h$hs_plusInt64(a1,a2,b1,b2) {
  var c = goog.math.Long.fromBits(a2,a1).add(goog.math.Long.fromBits(b2,b1));
  h$ret1 = c.getLowBits();
  return c.getHighBits();
}
function h$hs_minusInt64(a1,a2,b1,b2) {
  var c = goog.math.Long.fromBits(a2,a1).subtract(goog.math.Long.fromBits(b2,b1));
  h$ret1 = c.getLowBits();
  return c.getHighBits();
}
function h$hs_leWord64(a1,a2,b1,b2) {
  if(a1 === b1) {
    var a2s = a2 >>> 1;
    var b2s = b2 >>> 1;
    return (a2s < b2s || (a2s === b2s && ((a2&1) <= (b2&1)))) ? 1 : 0;
  } else {
    var a1s = a1 >>> 1;
    var b1s = b1 >>> 1;
    return (a1s < b1s || (a1s === b1s && ((a1&1) <= (b1&1)))) ? 1 : 0;
  }
}
function h$hs_ltWord64(a1,a2,b1,b2) {
  if(a1 === b1) {
    var a2s = a2 >>> 1;
    var b2s = b2 >>> 1;
    return (a2s < b2s || (a2s === b2s && ((a2&1) < (b2&1)))) ? 1 : 0;
  } else {
    var a1s = a1 >>> 1;
    var b1s = b1 >>> 1;
    return (a1s < b1s || (a1s === b1s && ((a1&1) < (b1&1)))) ? 1 : 0;
  }
}
function h$hs_geWord64(a1,a2,b1,b2) {
  if(a1 === b1) {
    var a2s = a2 >>> 1;
    var b2s = b2 >>> 1;
    return (a2s > b2s || (a2s === b2s && ((a2&1) >= (b2&1)))) ? 1 : 0;
  } else {
    var a1s = a1 >>> 1;
    var b1s = b1 >>> 1;
    return (a1s > b1s || (a1s === b1s && ((a1&1) >= (b1&1)))) ? 1 : 0;
  }
}
function h$hs_gtWord64(a1,a2,b1,b2) {
  if(a1 === b1) {
    var a2s = a2 >>> 1;
    var b2s = b2 >>> 1;
    return (a2s > b2s || (a2s === b2s && ((a2&1) > (b2&1)))) ? 1 : 0;
  } else {
    var a1s = a1 >>> 1;
    var b1s = b1 >>> 1;
    return (a1s > b1s || (a1s === b1s && ((a1&1) > (b1&1)))) ? 1 : 0;
  }
}
function h$hs_remWord64(a1,a2,b1,b2) {
  var a = h$bigFromWord64(a1,a2);
  var b = h$bigFromWord64(b1,b2);
  var c = a.mod(b);
  h$ret1 = c.intValue();
  return c.shiftRight(32).intValue();
}
function h$hs_uncheckedIShiftL64(a1,a2,n) {
  var num = new goog.math.Long(a2,a1).shiftLeft(n);
  h$ret1 = num.getLowBits();
  return num.getHighBits();
}
function h$hs_uncheckedIShiftRA64(a1,a2,n) {
  var num = new goog.math.Long(a2,a1).shiftRight(n);
  h$ret1 = num.getLowBits();
  return num.getHighBits();
}
function h$hs_uncheckedShiftL64(a1,a2,n) {
  n &= 63;
  if(n == 0) {
    h$ret1 = a2;
    return a1;
  } else if(n < 32) {
    h$ret1 = a2 << n;
    return (a1 << n) | (a2 >>> (32-n));
  } else {
    h$ret1 = 0;
    return ((a2 << (n-32))|0);
  }
}
function h$hs_uncheckedShiftRL64(a1,a2,n) {
  n &= 63;
  if(n == 0) {
    h$ret1 = a2;
    return a1;
  } else if(n < 32) {
    h$ret1 = (a2 >>> n ) | (a1 << (32-n));
    return a1 >>> n;
  } else {
    h$ret1 = a1 >>> (n-32);
    return 0;
  }
}
function h$imul_shim(a, b) {
    var ah = (a >>> 16) & 0xffff;
    var al = a & 0xffff;
    var bh = (b >>> 16) & 0xffff;
    var bl = b & 0xffff;
    return (((al * bl)|0) + (((ah * bl + al * bh) << 16) >>> 0)|0);
}
var h$mulInt32 = Math.imul ? Math.imul : h$imul_shim;
function h$mulWord32(a,b) {
  return goog.math.Long.fromBits(a,0).multiply(goog.math.Long.fromBits(b,0)).getLowBits();
}
function h$mul2Word32(a,b) {
  var c = goog.math.Long.fromBits(a,0).multiply(goog.math.Long.fromBits(b,0))
  h$ret1 = c.getLowBits();
  return c.getHighBits();
}
function h$quotWord32(a,b) {
  return goog.math.Long.fromBits(a,0).div(goog.math.Long.fromBits(b,0)).getLowBits();
}
function h$remWord32(a,b) {
  return goog.math.Long.fromBits(a,0).modulo(goog.math.Long.fromBits(b,0)).getLowBits();
}
function h$quotRem2Word32(a1,a2,b) {
  var a = h$bigFromWord64(a1,a2);
  var b = h$bigFromWord(b);
  var d = a.divide(b);
  h$ret1 = a.subtract(b.multiply(d)).intValue();
  return d.intValue();
}
function h$wordAdd2(a,b) {
  var c = goog.math.Long.fromBits(a,0).add(goog.math.Long.fromBits(b,0));
  h$ret1 = c.getLowBits();
  return c.getHighBits();
}
function h$uncheckedShiftRL64(a1,a2,n) {
  if(n < 0) throw "unexpected right shift";
  n &= 63;
  if(n == 0) {
    h$ret1 = a2;
    return a1;
  } else if(n < 32) {
    h$ret1 = (a2 >>> n) | (a1 << (32 - n));
    return (a1 >>> n);
  } else {
    h$ret1 = a2 >>> (n - 32);
    return 0;
  }
}
function h$isDoubleNegativeZero(d) {
  ;
  return (d===0 && (1/d) === -Infinity) ? 1 : 0;
}
function h$isFloatNegativeZero(d) {
  ;
  return (d===0 && (1/d) === -Infinity) ? 1 : 0;
}
function h$isDoubleInfinite(d) {
  return (d === Number.NEGATIVE_INFINITY || d === Number.POSITIVE_INFINITY) ? 1 : 0;
}
function h$isFloatInfinite(d) {
  return (d === Number.NEGATIVE_INFINITY || d === Number.POSITIVE_INFINITY) ? 1 : 0;
}
function h$isFloatFinite(d) {
  return (d !== Number.NEGATIVE_INFINITY && d !== Number.POSITIVE_INFINITY && !isNaN(d)) ? 1 : 0;
}
function h$isDoubleFinite(d) {
  return (d !== Number.NEGATIVE_INFINITY && d !== Number.POSITIVE_INFINITY && !isNaN(d)) ? 1 : 0;
}
function h$isDoubleNaN(d) {
  return (isNaN(d)) ? 1 : 0;
}
function h$isFloatNaN(d) {
  return (isNaN(d)) ? 1 : 0;
}
function h$isDoubleDenormalized(d) {
  return (d !== 0 && Math.abs(d) < 2.2250738585072014e-308) ? 1 : 0;
}
function h$isFloatDenormalized(d) {
  return (d !== 0 && Math.abs(d) < 2.2250738585072014e-308) ? 1 : 0;
}
function h$decodeFloatInt(d) {
    if(isNaN(d)) {
      h$ret1 = 105;
      return -12582912;
    }
    var exponent = h$integer_cmm_decodeDoublezh(d)+29;
    var significand = h$ret1.shiftRight(29).intValue();
    if(exponent > 105) {
      exponent = 105;
      significand = significand > 0 ? 8388608 : -8388608;
    } else if(exponent < -151) {
      significand = 0;
      exponent = 0;
    }
    h$ret1 = exponent;
    return significand;
}
function h$decodeDouble2Int(d) {
   var exponent = h$integer_cmm_decodeDoublezh(d);
   var significand = h$ret1;
   var sign = d<0?-1:1;
   h$ret1 = significand.shiftRight(32).intValue();
   h$ret2 = significand.intValue();
   return sign;
}
function h$rintDouble(a) {
  var rounda = Math.round(a);
  if(a >= 0) {
    if(a%1===0.5 && rounda%2===1) {
      return rounda-1;
    } else {
      return rounda;
    }
  } else {
    if(a%1===-0.5 && rounda%2===-1) {
      return rounda-1;
    } else {
      return rounda;
    }
  }
}
var h$rintFloat = h$rintDouble;
function h$acos(d) { return Math.acos(d); }
function h$acosf(f) { return Math.acos(f); }
function h$asin(d) { return Math.asin(d); }
function h$asinf(f) { return Math.asin(f); }
function h$atan(d) { return Math.atan(d); }
function h$atanf(f) { return Math.atan(f); }
function h$atan2(x,y) { return Math.atan2(x,y); }
function h$atan2f(x,y) { return Math.atan2(x,y); }
function h$cos(d) { return Math.cos(d); }
function h$cosf(f) { return Math.cos(f); }
function h$sin(d) { return Math.sin(d); }
function h$sinf(f) { return Math.sin(f); }
function h$tan(d) { return Math.tan(d); }
function h$tanf(f) { return Math.tan(f); }
function h$cosh(d) { return (Math.exp(d)+Math.exp(-d))/2; }
function h$coshf(f) { return h$cosh(f); }
function h$sinh(d) { return (Math.exp(d)-Math.exp(-d))/2; }
function h$sinhf(f) { return h$sinh(f); }
function h$tanh(d) { return (Math.exp(2*d)-1)/(Math.exp(2*d)+1); }
function h$tanhf(f) { return h$tanh(f); }
var h$popCntTab =
   [0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4,1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5,
    1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5,2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,
    1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5,2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,
    2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,3,4,4,5,4,5,5,6,4,5,5,6,5,6,6,7,
    1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5,2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,
    2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,3,4,4,5,4,5,5,6,4,5,5,6,5,6,6,7,
    2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,3,4,4,5,4,5,5,6,4,5,5,6,5,6,6,7,
    3,4,4,5,4,5,5,6,4,5,5,6,5,6,6,7,4,5,5,6,5,6,6,7,5,6,6,7,6,7,7,8];
function h$popCnt32(x) {
   return h$popCntTab[x&0xFF] +
          h$popCntTab[(x>>>8)&0xFF] +
          h$popCntTab[(x>>>16)&0xFF] +
          h$popCntTab[(x>>>24)&0xFF]
}
function h$popCnt64(x1,x2) {
   return h$popCntTab[x1&0xFF] +
          h$popCntTab[(x1>>>8)&0xFF] +
          h$popCntTab[(x1>>>16)&0xFF] +
          h$popCntTab[(x1>>>24)&0xFF] +
          h$popCntTab[x2&0xFF] +
          h$popCntTab[(x2>>>8)&0xFF] +
          h$popCntTab[(x2>>>16)&0xFF] +
          h$popCntTab[(x2>>>24)&0xFF];
}
function h$bswap64(x1,x2) {
  h$ret1 = (x1 >>> 24) | (x1 << 24) | ((x1 & 0xFF00) << 8) | ((x1 & 0xFF0000) >> 8);
  return (x2 >>> 24) | (x2 << 24) | ((x2 & 0xFF00) << 8) | ((x2 & 0xFF0000) >> 8);
}

function h$stdFd(n,readReady,writeReady,buf) {
  return new h$Fd(buf, readReady, writeReady, n);
}
var h$stdinBuf = { write: function() { throw "can't write to stdin"; } };
var h$stdoutBuf = { read: function() { throw "can't read from stdout"; } };
var h$stderrBuf = { read: function () { throw "can't read from stderr"; } };
function h$initStdioBufs() {
  if(typeof process !== 'undefined' && process && process.stdin) {
    h$stdinBuf.isATTY = process.stdin.isTTY;
    h$stdoutBuf.isATTY = process.stdout.isTTY;
    h$stderrBuf.isATTY = process.stderr.isTTY;
    h$stdinBuf.chunks = new goog.structs.Queue();
    h$stdinBuf.chunkOff = 0;
    h$stdinBuf.eof = false;
    h$stdinBuf.readReady = false;
    h$stdinBuf.writeReady = false;
    process.stdin.on('data', function(chunk) {
      h$stdinBuf.chunks.enqueue(chunk);
      h$stdin.readReady = true;
      h$notifyRead(h$stdin);
    });
    process.stdin.on('end', function() {
      h$stdinBuf.eof = true;
      h$stdin.readReady = true;
      h$notifyRead(h$stdin);
    });
    h$stdinBuf.read = function(fd, buf, buf_offset, n) {
      if(fd.buf.chunks.getCount() === 0) {
        return 0;
      } else {
        var h = fd.buf.chunks.peek();
        var o = fd.buf.chunkOff;
        var left = h.length - o;
        var u8 = buf.u8;
        if(left > n) {
          for(var i=0;i<n;i++) {
            u8[buf_offset+i] = h[o+i];
          }
          fd.buf.chunkOff += n;
          return n;
        } else {
          for(var i=0;i<left;i++) {
            u8[buf_offset+i] = h[o+i];
          }
          fd.buf.chunkOff = 0;
          fd.buf.chunks.dequeue();
          if(fd.buf.chunks.getCount() === 0 && !fd.buf.eof) {
            h$stdin.readReady = false;
          }
          return left;
        }
      }
    }
    h$stdoutBuf.write = function(fd, buf, buf_offset, n) {
      process.stdout.write(h$decodeUtf8(buf, n, buf_offset));
      return n;
    };
    h$stderrBuf.write = function(fd, buf, buf_offset, n) {
      process.stderr.write(h$decodeUtf8(buf, n, buf_offset));
      return n;
    };
  } else if(typeof putstr !== 'undefined') {
    h$stdoutBuf.isATTY = true;
    h$stderrBuf.isATTY = true;
    h$stdinBuf.isATTY = false;
    h$stdinBuf.readReady = true;
    h$stdinBuf.read = function() { return 0; }
    h$stdoutBuf.write = function(fd, buf, buf_offset, n) {
      putstr(h$decodeUtf8(buf, n, buf_offset));
      return n;
    }
    h$stderrBuf.write = function(fd, buf, buf_offset, n) {
      printErr(h$decodeUtf8(buf, n, buf_offset));
      return n;
    }
  } else {
    h$stdoutBuf.isATTY = true;
    h$stderrBuf.isATTY = true;
    h$stdinBuf.isATTY = false;
    h$stdinBuf.readReady = true;
    h$stdinBuf.read = function() { return 0; }
    var writeConsole = function(fd, buf, buf_offset, n) {
      if(typeof console !== 'undefined' && console && console.log) {
        console.log(h$decodeUtf8(buf, n, buf_offset));
      }
      return n;
    }
    h$stdoutBuf.write = writeConsole;
    h$stderrBuf.write = writeConsole;
  }
}
h$initStdioBufs();
var h$stdin = h$stdFd(0, false, false, h$stdinBuf);
var h$stdout = h$stdFd(1, false, true, h$stdoutBuf);
var h$stderr = h$stdFd(2, false, true, h$stderrBuf);
var h$fdN = 3;
var h$fds = { '0': h$stdin
            , '1': h$stdout
            , '2': h$stderr
            };
var h$filesMap = {};
function h$close(fd) {
  var f = h$fds[fd];
  if(f) {
    for(var i=0;i<f.waitRead.length;i++) {
      h$throwTo(f.waitRead[i], h$IOException);
    }
    for(var i=0;i<f.waitWrite.length;i++) {
      h$throwTo(f.waitWrite[i], h$IOException);
    }
    delete h$fds[fd];
    return 0;
  } else {
    h$errno = h$EBADF;
    return -1;
  }
}
function h$Fd(buf, readReady, writeReady, isATTY, n) {
  if(n !== undefined) {
    this.fd = n;
  } else {
    this.fd = h$fdN++;
  }
  this.pos = 0;
  this.buf = buf;
  this.waitRead = [];
  this.waitWrite = [];
  this.readReady = readReady;
  this.writeReady = writeReady;
  this.isATTY = isATTY;
}
function h$newFd(file) {
  var fd = new h$Fd(file, true, true, false);
  h$fds[fd.fd] = fd;
  return fd;
}
function h$newFile(path, data) {
  var f = { path: path
          , data: data
          , len: data.len
          , read: h$readFile
          , write: h$writeFile
          , isATTY: false
          };
  h$filesMap[path] = f;
  return f;
}
function h$notifyRead(fd) {
  var a = fd.waitRead;
  for(var i=0;i<a.length;i++) {
    h$wakeupThread(a[i]);
  }
  a.length = 0;
}
function h$notifyWrite(fd) {
  var a = fd.waitWrite;
  for(var i=0;i<a.length;i++) {
    h$wakupThread(a[i]);
  }
  fd.waitRead.length = 0;
}
function h$readFile() {
}
function h$loadFileData(path) {
  if(path.charCodeAt(path.length-1) === 0) {
    path = path.substring(0,path.length-1);
  }
  if(typeof h$nodeFs !== 'undefined' && h$nodeFs.readFileSync) {
    return h$fromNodeBuffer(h$nodeFs.readFileSync(path));
  } else if(typeof snarf !== 'undefined') {
    return new h$wrapBuffer(snarf(path, "binary").buffer, false);
  } else {
    var url = h$pathUrl(path);
    var transport = new XMLHttpRequest();
    transport.open("GET", url, false);
    transport.responseType = "arraybuffer";
    transport.send();
    if(transport.status == 200 || transport.status == 0) {
      return h$wrapBuffer(transport.response, false);
    } else {
      return null;
    }
  }
}
function h$fromNodeBuffer(buf) {
  var l = buf.length;
  var buf2 = new ArrayBuffer(l);
  var u8 = new Uint8Array(buf2);
  for(var i=0;i<l;i++) {
    u8[i] = buf[i];
  }
  return h$wrapBuffer(buf2, false);
}
function h$pathUrl(path) {
  return("://" + path);
}
function h$findFile(path) {
  return h$filesMap[path];
}
function h$isatty(d) {
  return h$fds[d].buf.isATTY?1:0;
}
function h$__hscore_bufsiz() { return 4096; }
function h$__hscore_seek_set() { return 0; }
function h$__hscore_seek_cur() { return 1; }
function h$__hscore_seek_end() { return 2; }
function h$__hscore_o_binary() { return 0; }
function h$__hscore_o_rdonly() { return 0; }
function h$__hscore_o_wronly() { return 0x0001; }
function h$__hscore_o_rdwr() { return 0x0002; }
function h$__hscore_o_append() { return 0x0008; }
function h$__hscore_o_creat() { return 0x0200; }
function h$__hscore_o_excl() { return 0x0800; }
function h$__hscore_o_trunc() { return 0x0400; }
function h$__hscore_o_noctty() { return 0x20000; }
function h$__hscore_o_nonblock() { return 0x0004; }
function h$__hscore_s_isdir() { return 0; }
function h$__hscore_s_isfifo() { return 0; }
function h$__hscore_s_isblk() { return 0; }
function h$__hscore_s_ischr() { return 0; }
function h$__hscore_s_issock() { return 0; }
function h$__hscore_s_isreg() { return 1; }
function h$S_ISDIR(mode) { return 0; }
function h$S_ISFIFO(mode) { return 0; }
function h$S_ISBLK(mode) { return 0; }
function h$S_ISCHR(mode) { return 0; }
function h$S_ISSOCK(mode) { return 0; }
function h$S_ISREG(mode) { return 1; }
function h$__hscore_sizeof_stat() { return 4; }
function h$__hscore_fstat(fd, buf, off) {
  var f = h$fds[fd];
  ;
  buf.dv.setUint32(off, f.buf.len, true);
  return 0;
}
function h$__hscore_st_mode(st) { return 0; }
function h$__hscore_st_dev() { return 0; }
function h$__hscore_st_ino() { return 0; }
function h$__hscore_st_size(st, off) {
    h$ret1 = st.dv.getInt32(off, true);
    return 0;
}
function h$__hscore_open(filename, filename_off, h, mode) {
    var p = h$decodeUtf8(filename, filename_off);
    ;
    var f = h$findFile(p);
    if(!f) {
      var d = h$loadFileData(p);
      var file = h$newFile(p,d);
      return h$newFd(file).fd;
    } else {
      return h$newFd(f).fd;
    }
}
function h$lseek(fd, offset1, offset2, whence) {
  var offset = goog.math.Long.fromBits(offset2,offset1).toNumber();
  ;
  var f = h$fds[fd];
  if(!f) {
    h$errno = h$EBADF;
    return -1;
  }
  var newOff;
  if(whence === 0) {
    newOff = offset;
  } else if(whence === 1) {
    newOff = f.pos + offset;
  } else if(whence === 2) {
    newOff = f.buf.len + offset;
  } else {
    h$errno = h$EINVAL;
    return -1;
  }
  if(newOff < 0) {
    h$errno = h$EINVAL;
    return -1;
  } else {
    f.pos = newOff;
    var no = goog.math.Long.fromNumber(newOff);
    h$ret1 = no.getLowBits();
    return no.getHighBits();
  }
}
function h$SEEK_SET() { return 0; }
function h$SEEK_CUR() { return 1; }
function h$SEEK_END() { return 2; }
var h$baseZCSystemziPosixziInternalsZClseek = h$lseek;
var h$baseZCSystemziPosixziInternalsZCSEEKzuCUR = h$__hscore_seek_cur;
var h$baseZCSystemziPosixziInternalsZCSEEKzuSET = h$__hscore_seek_set;
var h$baseZCSystemziPosixziInternalsZCSEEKzuEND = h$__hscore_seek_end;
var h$baseZCSystemziPosixziInternalsZCSzuISDIR = h$__hscore_s_isdir;
var h$baseZCSystemziPosixziInternalsZCSzuISFIFO = h$__hscore_s_isfifo;
var h$baseZCSystemziPosixziInternalsZCSzuISSOCK = h$__hscore_s_issock;
var h$baseZCSystemziPosixziInternalsZCSzuISCHR = h$__hscore_s_ischr;
var h$baseZCSystemziPosixziInternalsZCSzuISREG = h$__hscore_s_isreg;
var h$baseZCSystemziPosixziInternalsZCread = h$read;
function h$lockFile(fd, dev, ino, for_writing) {
    ;
    return 0;
}
function h$unlockFile(fd) {
    ;
    return 0;
}
function h$fdReady(fd, write, msecs, isSock) {
  var f = h$fds[fd];
  if(write) {
    if(f.writeReady) {
      return 1;
    } else if(msecs === 0) {
      return 0;
    } else {
      throw "h$fdReady: blocking not implemented";
    }
  } else {
    if(f.readReady) {
      return 1;
    } else if(msecs === 0) {
      return 0;
    } else {
      throw "h$fdReady: blocking not implemented";
    }
  }
}
function h$write(fd, buf, buf_offset, n) {
  ;
  var f = h$fds[fd];
  return f.buf.write(f, buf, buf_offset, n);
}
function h$read(fd, buf, buf_offset, n) {
  ;
  var f = h$fds[fd];
  return f.buf.read(f, buf, buf_offset, n);
}
var h$baseZCSystemziPosixziInternalsZCwrite = h$write;
function h$readFile(fd, buf, buf_offset, n) {
  ;
  var fbuf = fd.buf.data;
  var pos = fd.pos;
  n = Math.min(n, fd.buf.len - pos);
  for(var i=0;i<n;i++) {
    buf.u8[buf_offset+i] = fbuf.u8[pos+i];
  }
  fd.pos += n;
  ;
  return n;
}
function h$writeFile(fd, buf, buf_offset, n) {
  ;
  if(fd.pos + n > fd.buf.data.len) {
    var od = fd.buf.data;
    var d = h$newByteArray(Math.round(1.3*od.len)+100);
    var u8 = d.u8;
    var u8od = od.u8;
    for(var i=0;i<od.len;i++) {
      u8[i] = u8od[i];
    }
    fd.buf.data = d;
  }
  var offset = buf_offset + fd.pos;
  var bd = fd.buf.data;
  var u8 = bd.u8;
  var u8buf = buf.u8;
  for(var i=0;i<n;i++) {
    u8[offset+i] = u8buf[buf_offset+i];
  }
  fd.pos += n;
  fd.buf.len = Math.max(fd.buf.len, fd.pos);
  return n;
}

var h$printRanges = [32,95,160,13,174,714,890,5,900,7,908,1,910,20,931,389,1329,38,1369,7,1377,39,1417,2,1425,55,1488,27,1520,5,1542,22,1566,191,1758,48,1808,59,1869,101,1984,59,2048,46,2096,15,2112,28,2142,1,2304,120,2425,7,2433,3,2437,8,2447,2,2451,22,2474,7,2482,1,2486,4,2492,9,2503,2,2507,4,2519,1,2524,2,2527,5,2534,22,2561,3,2565,6,2575,2,2579,22,2602,7,2610,2,2613,2,2616,2,2620,1,2622,5,2631,2,2635,3,2641,1,2649,4,2654,1,2662,16,2689,3,2693,9,2703,3,2707,22,2730,7,2738,2,2741,5,2748,10,2759,3,2763,3,2768,1,2784,4,2790,10,2801,1,2817,3,2821,8,2831,2,2835,22,2858,7,2866,2,2869,5,2876,9,2887,2,2891,3,2902,2,2908,2,2911,5,2918,18,2946,2,2949,6,2958,3,2962,4,2969,2,2972,1,2974,2,2979,2,2984,3,2990,12,3006,5,3014,3,3018,4,3024,1,3031,1,3046,21,3073,3,3077,8,3086,3,3090,23,3114,10,3125,5,3133,8,3142,3,3146,4,3157,2,3160,2,3168,4,3174,10,3192,8,3202,2,3205,8,3214,3,3218,23,3242,10,3253,5,3260,9,3270,3,3274,4,3285,2,3294,1,3296,4,3302,10,3313,2,3330,2,3333,8,3342,3,3346,41,3389,8,3398,3,3402,5,3415,1,3424,4,3430,16,3449,7,3458,2,3461,18,3482,24,3507,9,3517,1,3520,7,3530,1,3535,6,3542,1,3544,8,3570,3,3585,58,3647,29,3713,2,3716,1,3719,2,3722,1,3725,1,3732,4,3737,7,3745,3,3749,1,3751,1,3754,2,3757,13,3771,3,3776,5,3782,1,3784,6,3792,10,3804,2,3840,72,3913,36,3953,39,3993,36,4030,15,4046,13,4096,198,4304,45,4352,329,4682,4,4688,7,4696,1,4698,4,4704,41,4746,4,4752,33,4786,4,4792,7,4800,1,4802,4,4808,15,4824,57,4882,4,4888,67,4957,32,4992,26,5024,85,5120,669,5792,81,5888,13,5902,7,5920,23,5952,20,5984,13,5998,3,6002,2,6016,52,6070,40,6112,10,6128,10,6144,15,6160,10,6176,88,6272,43,6320,70,6400,29,6432,12,6448,12,6464,1,6468,42,6512,5,6528,44,6576,26,6608,11,6622,62,6686,65,6752,29,6783,11,6800,10,6816,14,6912,76,6992,45,7040,43,7086,12,7104,52,7164,60,7227,15,7245,51,7376,35,7424,231,7676,282,7960,6,7968,38,8008,6,8016,8,8025,1,8027,1,8029,1,8031,31,8064,53,8118,15,8134,14,8150,6,8157,19,8178,3,8182,9,8192,11,8208,24,8239,49,8304,2,8308,27,8336,13,8352,26,8400,33,8448,138,8592,612,9216,39,9280,11,9312,672,9985,202,10188,1,10190,895,11088,10,11264,47,11312,47,11360,146,11513,45,11568,54,11631,2,11647,24,11680,7,11688,7,11696,7,11704,7,11712,7,11720,7,11728,7,11736,7,11744,82,11904,26,11931,89,12032,214,12272,12,12288,64,12353,86,12441,103,12549,41,12593,94,12688,43,12736,36,12784,47,12832,223,13056,6838,19904,21004,40960,1165,42128,55,42192,348,42560,52,42620,28,42656,88,42752,143,42896,2,42912,10,43002,50,43056,10,43072,56,43136,69,43214,12,43232,28,43264,84,43359,30,43392,78,43471,11,43486,2,43520,55,43584,14,43600,10,43612,32,43648,67,43739,5,43777,6,43785,6,43793,6,43808,7,43816,7,43968,46,44016,10,44032,11172,55216,23,55243,49,63744,302,64048,62,64112,106,64256,7,64275,5,64285,26,64312,5,64318,1,64320,2,64323,2,64326,124,64467,365,64848,64,64914,54,65008,14,65024,26,65056,7,65072,35,65108,19,65128,4,65136,5,65142,135,65281,190,65474,6,65482,6,65490,6,65498,3,65504,7,65512,7,65532,2,65536,12,65549,26,65576,19,65596,2,65599,15,65616,14,65664,123,65792,3,65799,45,65847,84,65936,12,66000,46,66176,29,66208,49,66304,31,66336,4,66352,27,66432,30,66463,37,66504,14,66560,158,66720,10,67584,6,67592,1,67594,44,67639,2,67644,1,67647,23,67671,9,67840,28,67871,27,67903,1,68096,4,68101,2,68108,8,68117,3,68121,27,68152,3,68159,9,68176,9,68192,32,68352,54,68409,29,68440,27,68472,8,68608,73,69216,31,69632,78,69714,30,69760,61,69822,4,73728,879,74752,99,74864,4,77824,1071,92160,569,110592,2,118784,246,119040,39,119081,74,119163,99,119296,70,119552,87,119648,18,119808,85,119894,71,119966,2,119970,1,119973,2,119977,4,119982,12,119995,1,119997,7,120005,65,120071,4,120077,8,120086,7,120094,28,120123,4,120128,5,120134,1,120138,7,120146,340,120488,292,120782,50,126976,44,127024,100,127136,15,127153,14,127169,15,127185,15,127232,11,127248,31,127280,58,127344,43,127462,29,127504,43,127552,9,127568,2,127744,33,127792,6,127799,70,127872,20,127904,37,127942,5,127968,17,128000,63,128064,1,128066,182,128249,4,128256,62,128336,24,128507,5,128513,16,128530,3,128534,1,128536,1,128538,1,128540,3,128544,6,128552,4,128557,1,128560,4,128565,12,128581,11,128640,70,128768,116,131072,42711,173824,4149,177984,222,194560,542];
var h$alnumRanges = [48,10,65,26,97,26,170,1,178,2,181,1,185,2,188,3,192,23,216,31,248,458,710,12,736,5,748,1,750,1,768,117,886,2,890,4,902,1,904,3,908,1,910,20,931,83,1015,139,1155,165,1329,38,1369,1,1377,39,1425,45,1471,1,1473,2,1476,2,1479,1,1488,27,1520,3,1552,11,1568,74,1646,102,1749,8,1759,10,1770,19,1791,1,1808,59,1869,101,1984,54,2042,1,2048,46,2112,28,2304,100,2406,10,2417,7,2425,7,2433,3,2437,8,2447,2,2451,22,2474,7,2482,1,2486,4,2492,9,2503,2,2507,4,2519,1,2524,2,2527,5,2534,12,2548,6,2561,3,2565,6,2575,2,2579,22,2602,7,2610,2,2613,2,2616,2,2620,1,2622,5,2631,2,2635,3,2641,1,2649,4,2654,1,2662,16,2689,3,2693,9,2703,3,2707,22,2730,7,2738,2,2741,5,2748,10,2759,3,2763,3,2768,1,2784,4,2790,10,2817,3,2821,8,2831,2,2835,22,2858,7,2866,2,2869,5,2876,9,2887,2,2891,3,2902,2,2908,2,2911,5,2918,10,2929,7,2946,2,2949,6,2958,3,2962,4,2969,2,2972,1,2974,2,2979,2,2984,3,2990,12,3006,5,3014,3,3018,4,3024,1,3031,1,3046,13,3073,3,3077,8,3086,3,3090,23,3114,10,3125,5,3133,8,3142,3,3146,4,3157,2,3160,2,3168,4,3174,10,3192,7,3202,2,3205,8,3214,3,3218,23,3242,10,3253,5,3260,9,3270,3,3274,4,3285,2,3294,1,3296,4,3302,10,3313,2,3330,2,3333,8,3342,3,3346,41,3389,8,3398,3,3402,5,3415,1,3424,4,3430,16,3450,6,3458,2,3461,18,3482,24,3507,9,3517,1,3520,7,3530,1,3535,6,3542,1,3544,8,3570,2,3585,58,3648,15,3664,10,3713,2,3716,1,3719,2,3722,1,3725,1,3732,4,3737,7,3745,3,3749,1,3751,1,3754,2,3757,13,3771,3,3776,5,3782,1,3784,6,3792,10,3804,2,3840,1,3864,2,3872,20,3893,1,3895,1,3897,1,3902,10,3913,36,3953,20,3974,18,3993,36,4038,1,4096,74,4176,78,4256,38,4304,43,4348,1,4352,329,4682,4,4688,7,4696,1,4698,4,4704,41,4746,4,4752,33,4786,4,4792,7,4800,1,4802,4,4808,15,4824,57,4882,4,4888,67,4957,3,4969,20,4992,16,5024,85,5121,620,5743,17,5761,26,5792,75,5870,3,5888,13,5902,7,5920,21,5952,20,5984,13,5998,3,6002,2,6016,52,6070,30,6103,1,6108,2,6112,10,6128,10,6155,3,6160,10,6176,88,6272,43,6320,70,6400,29,6432,12,6448,12,6470,40,6512,5,6528,44,6576,26,6608,11,6656,28,6688,63,6752,29,6783,11,6800,10,6823,1,6912,76,6992,10,7019,9,7040,43,7086,12,7104,52,7168,56,7232,10,7245,49,7376,3,7380,31,7424,231,7676,282,7960,6,7968,38,8008,6,8016,8,8025,1,8027,1,8029,1,8031,31,8064,53,8118,7,8126,1,8130,3,8134,7,8144,4,8150,6,8160,13,8178,3,8182,7,8304,2,8308,6,8319,11,8336,13,8400,33,8450,1,8455,1,8458,10,8469,1,8473,5,8484,1,8486,1,8488,1,8490,4,8495,11,8508,4,8517,5,8526,1,8528,58,9312,60,9450,22,10102,30,11264,47,11312,47,11360,133,11499,7,11517,1,11520,38,11568,54,11631,1,11647,24,11680,7,11688,7,11696,7,11704,7,11712,7,11720,7,11728,7,11736,7,11744,32,11823,1,12293,3,12321,15,12337,5,12344,5,12353,86,12441,2,12445,3,12449,90,12540,4,12549,41,12593,94,12690,4,12704,27,12784,16,12832,10,12881,15,12928,10,12977,15,13312,6582,19968,20940,40960,1165,42192,46,42240,269,42512,28,42560,51,42620,2,42623,25,42656,82,42775,9,42786,103,42891,4,42896,2,42912,10,43002,46,43056,6,43072,52,43136,69,43216,10,43232,24,43259,1,43264,46,43312,36,43360,29,43392,65,43471,11,43520,55,43584,14,43600,10,43616,23,43642,2,43648,67,43739,3,43777,6,43785,6,43793,6,43808,7,43816,7,43968,43,44012,2,44016,10,44032,11172,55216,23,55243,49,63744,302,64048,62,64112,106,64256,7,64275,5,64285,12,64298,13,64312,5,64318,1,64320,2,64323,2,64326,108,64467,363,64848,64,64914,54,65008,12,65024,16,65056,7,65136,5,65142,135,65296,10,65313,26,65345,26,65382,89,65474,6,65482,6,65490,6,65498,3,65536,12,65549,26,65576,19,65596,2,65599,15,65616,14,65664,123,65799,45,65856,57,65930,1,66045,1,66176,29,66208,49,66304,31,66336,4,66352,27,66432,30,66464,36,66504,8,66513,5,66560,158,66720,10,67584,6,67592,1,67594,44,67639,2,67644,1,67647,23,67672,8,67840,28,67872,26,68096,4,68101,2,68108,8,68117,3,68121,27,68152,3,68159,9,68192,31,68352,54,68416,22,68440,27,68472,8,68608,73,69216,31,69632,71,69714,30,69760,59,73728,879,74752,99,77824,1071,92160,569,110592,2,119141,5,119149,6,119163,8,119173,7,119210,4,119362,3,119648,18,119808,85,119894,71,119966,2,119970,1,119973,2,119977,4,119982,12,119995,1,119997,7,120005,65,120071,4,120077,8,120086,7,120094,28,120123,4,120128,5,120134,1,120138,7,120146,340,120488,25,120514,25,120540,31,120572,25,120598,31,120630,25,120656,31,120688,25,120714,31,120746,25,120772,8,120782,50,127232,11,131072,42711,173824,4149,177984,222,194560,542];
var h$lowerRanges = [97,26,170,1,181,1,186,1,223,24,248,8,257,1,259,1,261,1,263,1,265,1,267,1,269,1,271,1,273,1,275,1,277,1,279,1,281,1,283,1,285,1,287,1,289,1,291,1,293,1,295,1,297,1,299,1,301,1,303,1,305,1,307,1,309,1,311,2,314,1,316,1,318,1,320,1,322,1,324,1,326,1,328,2,331,1,333,1,335,1,337,1,339,1,341,1,343,1,345,1,347,1,349,1,351,1,353,1,355,1,357,1,359,1,361,1,363,1,365,1,367,1,369,1,371,1,373,1,375,1,378,1,380,1,382,3,387,1,389,1,392,1,396,2,402,1,405,1,409,3,414,1,417,1,419,1,421,1,424,1,426,2,429,1,432,1,436,1,438,1,441,2,445,3,454,1,457,1,460,1,462,1,464,1,466,1,468,1,470,1,472,1,474,1,476,2,479,1,481,1,483,1,485,1,487,1,489,1,491,1,493,1,495,2,499,1,501,1,505,1,507,1,509,1,511,1,513,1,515,1,517,1,519,1,521,1,523,1,525,1,527,1,529,1,531,1,533,1,535,1,537,1,539,1,541,1,543,1,545,1,547,1,549,1,551,1,553,1,555,1,557,1,559,1,561,1,563,7,572,1,575,2,578,1,583,1,585,1,587,1,589,1,591,69,661,27,881,1,883,1,887,1,891,3,912,1,940,35,976,2,981,3,985,1,987,1,989,1,991,1,993,1,995,1,997,1,999,1,1001,1,1003,1,1005,1,1007,5,1013,1,1016,1,1019,2,1072,48,1121,1,1123,1,1125,1,1127,1,1129,1,1131,1,1133,1,1135,1,1137,1,1139,1,1141,1,1143,1,1145,1,1147,1,1149,1,1151,1,1153,1,1163,1,1165,1,1167,1,1169,1,1171,1,1173,1,1175,1,1177,1,1179,1,1181,1,1183,1,1185,1,1187,1,1189,1,1191,1,1193,1,1195,1,1197,1,1199,1,1201,1,1203,1,1205,1,1207,1,1209,1,1211,1,1213,1,1215,1,1218,1,1220,1,1222,1,1224,1,1226,1,1228,1,1230,2,1233,1,1235,1,1237,1,1239,1,1241,1,1243,1,1245,1,1247,1,1249,1,1251,1,1253,1,1255,1,1257,1,1259,1,1261,1,1263,1,1265,1,1267,1,1269,1,1271,1,1273,1,1275,1,1277,1,1279,1,1281,1,1283,1,1285,1,1287,1,1289,1,1291,1,1293,1,1295,1,1297,1,1299,1,1301,1,1303,1,1305,1,1307,1,1309,1,1311,1,1313,1,1315,1,1317,1,1319,1,1377,39,7424,44,7522,22,7545,34,7681,1,7683,1,7685,1,7687,1,7689,1,7691,1,7693,1,7695,1,7697,1,7699,1,7701,1,7703,1,7705,1,7707,1,7709,1,7711,1,7713,1,7715,1,7717,1,7719,1,7721,1,7723,1,7725,1,7727,1,7729,1,7731,1,7733,1,7735,1,7737,1,7739,1,7741,1,7743,1,7745,1,7747,1,7749,1,7751,1,7753,1,7755,1,7757,1,7759,1,7761,1,7763,1,7765,1,7767,1,7769,1,7771,1,7773,1,7775,1,7777,1,7779,1,7781,1,7783,1,7785,1,7787,1,7789,1,7791,1,7793,1,7795,1,7797,1,7799,1,7801,1,7803,1,7805,1,7807,1,7809,1,7811,1,7813,1,7815,1,7817,1,7819,1,7821,1,7823,1,7825,1,7827,1,7829,9,7839,1,7841,1,7843,1,7845,1,7847,1,7849,1,7851,1,7853,1,7855,1,7857,1,7859,1,7861,1,7863,1,7865,1,7867,1,7869,1,7871,1,7873,1,7875,1,7877,1,7879,1,7881,1,7883,1,7885,1,7887,1,7889,1,7891,1,7893,1,7895,1,7897,1,7899,1,7901,1,7903,1,7905,1,7907,1,7909,1,7911,1,7913,1,7915,1,7917,1,7919,1,7921,1,7923,1,7925,1,7927,1,7929,1,7931,1,7933,1,7935,9,7952,6,7968,8,7984,8,8000,6,8016,8,8032,8,8048,14,8064,8,8080,8,8096,8,8112,5,8118,2,8126,1,8130,3,8134,2,8144,4,8150,2,8160,8,8178,3,8182,2,8458,1,8462,2,8467,1,8495,1,8500,1,8505,1,8508,2,8518,4,8526,1,8580,1,11312,47,11361,1,11365,2,11368,1,11370,1,11372,1,11377,1,11379,2,11382,7,11393,1,11395,1,11397,1,11399,1,11401,1,11403,1,11405,1,11407,1,11409,1,11411,1,11413,1,11415,1,11417,1,11419,1,11421,1,11423,1,11425,1,11427,1,11429,1,11431,1,11433,1,11435,1,11437,1,11439,1,11441,1,11443,1,11445,1,11447,1,11449,1,11451,1,11453,1,11455,1,11457,1,11459,1,11461,1,11463,1,11465,1,11467,1,11469,1,11471,1,11473,1,11475,1,11477,1,11479,1,11481,1,11483,1,11485,1,11487,1,11489,1,11491,2,11500,1,11502,1,11520,38,42561,1,42563,1,42565,1,42567,1,42569,1,42571,1,42573,1,42575,1,42577,1,42579,1,42581,1,42583,1,42585,1,42587,1,42589,1,42591,1,42593,1,42595,1,42597,1,42599,1,42601,1,42603,1,42605,1,42625,1,42627,1,42629,1,42631,1,42633,1,42635,1,42637,1,42639,1,42641,1,42643,1,42645,1,42647,1,42787,1,42789,1,42791,1,42793,1,42795,1,42797,1,42799,3,42803,1,42805,1,42807,1,42809,1,42811,1,42813,1,42815,1,42817,1,42819,1,42821,1,42823,1,42825,1,42827,1,42829,1,42831,1,42833,1,42835,1,42837,1,42839,1,42841,1,42843,1,42845,1,42847,1,42849,1,42851,1,42853,1,42855,1,42857,1,42859,1,42861,1,42863,1,42865,8,42874,1,42876,1,42879,1,42881,1,42883,1,42885,1,42887,1,42892,1,42894,1,42897,1,42913,1,42915,1,42917,1,42919,1,42921,1,43002,1,64256,7,64275,5,65345,26,66600,40,119834,26,119886,7,119894,18,119938,26,119990,4,119995,1,119997,7,120005,11,120042,26,120094,26,120146,26,120198,26,120250,26,120302,26,120354,26,120406,26,120458,28,120514,25,120540,6,120572,25,120598,6,120630,25,120656,6,120688,25,120714,6,120746,25,120772,6,120779,1];
var h$upperRanges = [65,26,192,23,216,7,256,1,258,1,260,1,262,1,264,1,266,1,268,1,270,1,272,1,274,1,276,1,278,1,280,1,282,1,284,1,286,1,288,1,290,1,292,1,294,1,296,1,298,1,300,1,302,1,304,1,306,1,308,1,310,1,313,1,315,1,317,1,319,1,321,1,323,1,325,1,327,1,330,1,332,1,334,1,336,1,338,1,340,1,342,1,344,1,346,1,348,1,350,1,352,1,354,1,356,1,358,1,360,1,362,1,364,1,366,1,368,1,370,1,372,1,374,1,376,2,379,1,381,1,385,2,388,1,390,2,393,3,398,4,403,2,406,3,412,2,415,2,418,1,420,1,422,2,425,1,428,1,430,2,433,3,437,1,439,2,444,1,452,2,455,2,458,2,461,1,463,1,465,1,467,1,469,1,471,1,473,1,475,1,478,1,480,1,482,1,484,1,486,1,488,1,490,1,492,1,494,1,497,2,500,1,502,3,506,1,508,1,510,1,512,1,514,1,516,1,518,1,520,1,522,1,524,1,526,1,528,1,530,1,532,1,534,1,536,1,538,1,540,1,542,1,544,1,546,1,548,1,550,1,552,1,554,1,556,1,558,1,560,1,562,1,570,2,573,2,577,1,579,4,584,1,586,1,588,1,590,1,880,1,882,1,886,1,902,1,904,3,908,1,910,2,913,17,931,9,975,1,978,3,984,1,986,1,988,1,990,1,992,1,994,1,996,1,998,1,1000,1,1002,1,1004,1,1006,1,1012,1,1015,1,1017,2,1021,51,1120,1,1122,1,1124,1,1126,1,1128,1,1130,1,1132,1,1134,1,1136,1,1138,1,1140,1,1142,1,1144,1,1146,1,1148,1,1150,1,1152,1,1162,1,1164,1,1166,1,1168,1,1170,1,1172,1,1174,1,1176,1,1178,1,1180,1,1182,1,1184,1,1186,1,1188,1,1190,1,1192,1,1194,1,1196,1,1198,1,1200,1,1202,1,1204,1,1206,1,1208,1,1210,1,1212,1,1214,1,1216,2,1219,1,1221,1,1223,1,1225,1,1227,1,1229,1,1232,1,1234,1,1236,1,1238,1,1240,1,1242,1,1244,1,1246,1,1248,1,1250,1,1252,1,1254,1,1256,1,1258,1,1260,1,1262,1,1264,1,1266,1,1268,1,1270,1,1272,1,1274,1,1276,1,1278,1,1280,1,1282,1,1284,1,1286,1,1288,1,1290,1,1292,1,1294,1,1296,1,1298,1,1300,1,1302,1,1304,1,1306,1,1308,1,1310,1,1312,1,1314,1,1316,1,1318,1,1329,38,4256,38,7680,1,7682,1,7684,1,7686,1,7688,1,7690,1,7692,1,7694,1,7696,1,7698,1,7700,1,7702,1,7704,1,7706,1,7708,1,7710,1,7712,1,7714,1,7716,1,7718,1,7720,1,7722,1,7724,1,7726,1,7728,1,7730,1,7732,1,7734,1,7736,1,7738,1,7740,1,7742,1,7744,1,7746,1,7748,1,7750,1,7752,1,7754,1,7756,1,7758,1,7760,1,7762,1,7764,1,7766,1,7768,1,7770,1,7772,1,7774,1,7776,1,7778,1,7780,1,7782,1,7784,1,7786,1,7788,1,7790,1,7792,1,7794,1,7796,1,7798,1,7800,1,7802,1,7804,1,7806,1,7808,1,7810,1,7812,1,7814,1,7816,1,7818,1,7820,1,7822,1,7824,1,7826,1,7828,1,7838,1,7840,1,7842,1,7844,1,7846,1,7848,1,7850,1,7852,1,7854,1,7856,1,7858,1,7860,1,7862,1,7864,1,7866,1,7868,1,7870,1,7872,1,7874,1,7876,1,7878,1,7880,1,7882,1,7884,1,7886,1,7888,1,7890,1,7892,1,7894,1,7896,1,7898,1,7900,1,7902,1,7904,1,7906,1,7908,1,7910,1,7912,1,7914,1,7916,1,7918,1,7920,1,7922,1,7924,1,7926,1,7928,1,7930,1,7932,1,7934,1,7944,8,7960,6,7976,8,7992,8,8008,6,8025,1,8027,1,8029,1,8031,1,8040,8,8072,8,8088,8,8104,8,8120,5,8136,5,8152,4,8168,5,8184,5,8450,1,8455,1,8459,3,8464,3,8469,1,8473,5,8484,1,8486,1,8488,1,8490,4,8496,4,8510,2,8517,1,8579,1,11264,47,11360,1,11362,3,11367,1,11369,1,11371,1,11373,4,11378,1,11381,1,11390,3,11394,1,11396,1,11398,1,11400,1,11402,1,11404,1,11406,1,11408,1,11410,1,11412,1,11414,1,11416,1,11418,1,11420,1,11422,1,11424,1,11426,1,11428,1,11430,1,11432,1,11434,1,11436,1,11438,1,11440,1,11442,1,11444,1,11446,1,11448,1,11450,1,11452,1,11454,1,11456,1,11458,1,11460,1,11462,1,11464,1,11466,1,11468,1,11470,1,11472,1,11474,1,11476,1,11478,1,11480,1,11482,1,11484,1,11486,1,11488,1,11490,1,11499,1,11501,1,42560,1,42562,1,42564,1,42566,1,42568,1,42570,1,42572,1,42574,1,42576,1,42578,1,42580,1,42582,1,42584,1,42586,1,42588,1,42590,1,42592,1,42594,1,42596,1,42598,1,42600,1,42602,1,42604,1,42624,1,42626,1,42628,1,42630,1,42632,1,42634,1,42636,1,42638,1,42640,1,42642,1,42644,1,42646,1,42786,1,42788,1,42790,1,42792,1,42794,1,42796,1,42798,1,42802,1,42804,1,42806,1,42808,1,42810,1,42812,1,42814,1,42816,1,42818,1,42820,1,42822,1,42824,1,42826,1,42828,1,42830,1,42832,1,42834,1,42836,1,42838,1,42840,1,42842,1,42844,1,42846,1,42848,1,42850,1,42852,1,42854,1,42856,1,42858,1,42860,1,42862,1,42873,1,42875,1,42877,2,42880,1,42882,1,42884,1,42886,1,42891,1,42893,1,42896,1,42912,1,42914,1,42916,1,42918,1,42920,1,65313,26,66560,40,119808,26,119860,26,119912,26,119964,1,119966,2,119970,1,119973,2,119977,4,119982,8,120016,26,120068,2,120071,4,120077,8,120086,7,120120,2,120123,4,120128,5,120134,1,120138,7,120172,26,120224,26,120276,26,120328,26,120380,26,120432,26,120488,25,120546,25,120604,25,120662,25,120720,25,120778,1];
var h$alphaRanges = [65,26,97,26,170,1,181,1,186,1,192,23,216,31,248,458,710,12,736,5,748,1,750,1,880,5,886,2,890,4,902,1,904,3,908,1,910,20,931,83,1015,139,1162,158,1329,38,1369,1,1377,39,1488,27,1520,3,1568,43,1646,2,1649,99,1749,1,1765,2,1774,2,1786,3,1791,1,1808,1,1810,30,1869,89,1969,1,1994,33,2036,2,2042,1,2048,22,2074,1,2084,1,2088,1,2112,25,2308,54,2365,1,2384,1,2392,10,2417,7,2425,7,2437,8,2447,2,2451,22,2474,7,2482,1,2486,4,2493,1,2510,1,2524,2,2527,3,2544,2,2565,6,2575,2,2579,22,2602,7,2610,2,2613,2,2616,2,2649,4,2654,1,2674,3,2693,9,2703,3,2707,22,2730,7,2738,2,2741,5,2749,1,2768,1,2784,2,2821,8,2831,2,2835,22,2858,7,2866,2,2869,5,2877,1,2908,2,2911,3,2929,1,2947,1,2949,6,2958,3,2962,4,2969,2,2972,1,2974,2,2979,2,2984,3,2990,12,3024,1,3077,8,3086,3,3090,23,3114,10,3125,5,3133,1,3160,2,3168,2,3205,8,3214,3,3218,23,3242,10,3253,5,3261,1,3294,1,3296,2,3313,2,3333,8,3342,3,3346,41,3389,1,3406,1,3424,2,3450,6,3461,18,3482,24,3507,9,3517,1,3520,7,3585,48,3634,2,3648,7,3713,2,3716,1,3719,2,3722,1,3725,1,3732,4,3737,7,3745,3,3749,1,3751,1,3754,2,3757,4,3762,2,3773,1,3776,5,3782,1,3804,2,3840,1,3904,8,3913,36,3976,5,4096,43,4159,1,4176,6,4186,4,4193,1,4197,2,4206,3,4213,13,4238,1,4256,38,4304,43,4348,1,4352,329,4682,4,4688,7,4696,1,4698,4,4704,41,4746,4,4752,33,4786,4,4792,7,4800,1,4802,4,4808,15,4824,57,4882,4,4888,67,4992,16,5024,85,5121,620,5743,17,5761,26,5792,75,5888,13,5902,4,5920,18,5952,18,5984,13,5998,3,6016,52,6103,1,6108,1,6176,88,6272,41,6314,1,6320,70,6400,29,6480,30,6512,5,6528,44,6593,7,6656,23,6688,53,6823,1,6917,47,6981,7,7043,30,7086,2,7104,38,7168,36,7245,3,7258,36,7401,4,7406,4,7424,192,7680,278,7960,6,7968,38,8008,6,8016,8,8025,1,8027,1,8029,1,8031,31,8064,53,8118,7,8126,1,8130,3,8134,7,8144,4,8150,6,8160,13,8178,3,8182,7,8305,1,8319,1,8336,13,8450,1,8455,1,8458,10,8469,1,8473,5,8484,1,8486,1,8488,1,8490,4,8495,11,8508,4,8517,5,8526,1,8579,2,11264,47,11312,47,11360,133,11499,4,11520,38,11568,54,11631,1,11648,23,11680,7,11688,7,11696,7,11704,7,11712,7,11720,7,11728,7,11736,7,11823,1,12293,2,12337,5,12347,2,12353,86,12445,3,12449,90,12540,4,12549,41,12593,94,12704,27,12784,16,13312,6582,19968,20940,40960,1165,42192,46,42240,269,42512,16,42538,2,42560,47,42623,25,42656,70,42775,9,42786,103,42891,4,42896,2,42912,10,43002,8,43011,3,43015,4,43020,23,43072,52,43138,50,43250,6,43259,1,43274,28,43312,23,43360,29,43396,47,43471,1,43520,41,43584,3,43588,8,43616,23,43642,1,43648,48,43697,1,43701,2,43705,5,43712,1,43714,1,43739,3,43777,6,43785,6,43793,6,43808,7,43816,7,43968,35,44032,11172,55216,23,55243,49,63744,302,64048,62,64112,106,64256,7,64275,5,64285,1,64287,10,64298,13,64312,5,64318,1,64320,2,64323,2,64326,108,64467,363,64848,64,64914,54,65008,12,65136,5,65142,135,65313,26,65345,26,65382,89,65474,6,65482,6,65490,6,65498,3,65536,12,65549,26,65576,19,65596,2,65599,15,65616,14,65664,123,66176,29,66208,49,66304,31,66352,17,66370,8,66432,30,66464,36,66504,8,66560,158,67584,6,67592,1,67594,44,67639,2,67644,1,67647,23,67840,22,67872,26,68096,1,68112,4,68117,3,68121,27,68192,29,68352,54,68416,22,68448,19,68608,73,69635,53,69763,45,73728,879,77824,1071,92160,569,110592,2,119808,85,119894,71,119966,2,119970,1,119973,2,119977,4,119982,12,119995,1,119997,7,120005,65,120071,4,120077,8,120086,7,120094,28,120123,4,120128,5,120134,1,120138,7,120146,340,120488,25,120514,25,120540,31,120572,25,120598,31,120630,25,120656,31,120688,25,120714,31,120746,25,120772,8,131072,42711,173824,4149,177984,222,194560,542];
var h$toUpperMapping = [97,65,98,66,99,67,100,68,101,69,102,70,103,71,104,72,105,73,106,74,107,75,108,76,109,77,110,78,111,79,112,80,113,81,114,82,115,83,116,84,117,85,118,86,119,87,120,88,121,89,122,90,181,924,224,192,225,193,226,194,227,195,228,196,229,197,230,198,231,199,232,200,233,201,234,202,235,203,236,204,237,205,238,206,239,207,240,208,241,209,242,210,243,211,244,212,245,213,246,214,248,216,249,217,250,218,251,219,252,220,253,221,254,222,255,376,257,256,259,258,261,260,263,262,265,264,267,266,269,268,271,270,273,272,275,274,277,276,279,278,281,280,283,282,285,284,287,286,289,288,291,290,293,292,295,294,297,296,299,298,301,300,303,302,305,73,307,306,309,308,311,310,314,313,316,315,318,317,320,319,322,321,324,323,326,325,328,327,331,330,333,332,335,334,337,336,339,338,341,340,343,342,345,344,347,346,349,348,351,350,353,352,355,354,357,356,359,358,361,360,363,362,365,364,367,366,369,368,371,370,373,372,375,374,378,377,380,379,382,381,383,83,384,579,387,386,389,388,392,391,396,395,402,401,405,502,409,408,410,573,414,544,417,416,419,418,421,420,424,423,429,428,432,431,436,435,438,437,441,440,445,444,447,503,453,452,454,452,456,455,457,455,459,458,460,458,462,461,464,463,466,465,468,467,470,469,472,471,474,473,476,475,477,398,479,478,481,480,483,482,485,484,487,486,489,488,491,490,493,492,495,494,498,497,499,497,501,500,505,504,507,506,509,508,511,510,513,512,515,514,517,516,519,518,521,520,523,522,525,524,527,526,529,528,531,530,533,532,535,534,537,536,539,538,541,540,543,542,547,546,549,548,551,550,553,552,555,554,557,556,559,558,561,560,563,562,572,571,575,11390,576,11391,578,577,583,582,585,584,587,586,589,588,591,590,592,11375,593,11373,594,11376,595,385,596,390,598,393,599,394,601,399,603,400,608,403,611,404,613,42893,616,407,617,406,619,11362,623,412,625,11374,626,413,629,415,637,11364,640,422,643,425,648,430,649,580,650,433,651,434,652,581,658,439,837,921,881,880,883,882,887,886,891,1021,892,1022,893,1023,940,902,941,904,942,905,943,906,945,913,946,914,947,915,948,916,949,917,950,918,951,919,952,920,953,921,954,922,955,923,956,924,957,925,958,926,959,927,960,928,961,929,962,931,963,931,964,932,965,933,966,934,967,935,968,936,969,937,970,938,971,939,972,908,973,910,974,911,976,914,977,920,981,934,982,928,983,975,985,984,987,986,989,988,991,990,993,992,995,994,997,996,999,998,1001,1000,1003,1002,1005,1004,1007,1006,1008,922,1009,929,1010,1017,1013,917,1016,1015,1019,1018,1072,1040,1073,1041,1074,1042,1075,1043,1076,1044,1077,1045,1078,1046,1079,1047,1080,1048,1081,1049,1082,1050,1083,1051,1084,1052,1085,1053,1086,1054,1087,1055,1088,1056,1089,1057,1090,1058,1091,1059,1092,1060,1093,1061,1094,1062,1095,1063,1096,1064,1097,1065,1098,1066,1099,1067,1100,1068,1101,1069,1102,1070,1103,1071,1104,1024,1105,1025,1106,1026,1107,1027,1108,1028,1109,1029,1110,1030,1111,1031,1112,1032,1113,1033,1114,1034,1115,1035,1116,1036,1117,1037,1118,1038,1119,1039,1121,1120,1123,1122,1125,1124,1127,1126,1129,1128,1131,1130,1133,1132,1135,1134,1137,1136,1139,1138,1141,1140,1143,1142,1145,1144,1147,1146,1149,1148,1151,1150,1153,1152,1163,1162,1165,1164,1167,1166,1169,1168,1171,1170,1173,1172,1175,1174,1177,1176,1179,1178,1181,1180,1183,1182,1185,1184,1187,1186,1189,1188,1191,1190,1193,1192,1195,1194,1197,1196,1199,1198,1201,1200,1203,1202,1205,1204,1207,1206,1209,1208,1211,1210,1213,1212,1215,1214,1218,1217,1220,1219,1222,1221,1224,1223,1226,1225,1228,1227,1230,1229,1231,1216,1233,1232,1235,1234,1237,1236,1239,1238,1241,1240,1243,1242,1245,1244,1247,1246,1249,1248,1251,1250,1253,1252,1255,1254,1257,1256,1259,1258,1261,1260,1263,1262,1265,1264,1267,1266,1269,1268,1271,1270,1273,1272,1275,1274,1277,1276,1279,1278,1281,1280,1283,1282,1285,1284,1287,1286,1289,1288,1291,1290,1293,1292,1295,1294,1297,1296,1299,1298,1301,1300,1303,1302,1305,1304,1307,1306,1309,1308,1311,1310,1313,1312,1315,1314,1317,1316,1319,1318,1377,1329,1378,1330,1379,1331,1380,1332,1381,1333,1382,1334,1383,1335,1384,1336,1385,1337,1386,1338,1387,1339,1388,1340,1389,1341,1390,1342,1391,1343,1392,1344,1393,1345,1394,1346,1395,1347,1396,1348,1397,1349,1398,1350,1399,1351,1400,1352,1401,1353,1402,1354,1403,1355,1404,1356,1405,1357,1406,1358,1407,1359,1408,1360,1409,1361,1410,1362,1411,1363,1412,1364,1413,1365,1414,1366,7545,42877,7549,11363,7681,7680,7683,7682,7685,7684,7687,7686,7689,7688,7691,7690,7693,7692,7695,7694,7697,7696,7699,7698,7701,7700,7703,7702,7705,7704,7707,7706,7709,7708,7711,7710,7713,7712,7715,7714,7717,7716,7719,7718,7721,7720,7723,7722,7725,7724,7727,7726,7729,7728,7731,7730,7733,7732,7735,7734,7737,7736,7739,7738,7741,7740,7743,7742,7745,7744,7747,7746,7749,7748,7751,7750,7753,7752,7755,7754,7757,7756,7759,7758,7761,7760,7763,7762,7765,7764,7767,7766,7769,7768,7771,7770,7773,7772,7775,7774,7777,7776,7779,7778,7781,7780,7783,7782,7785,7784,7787,7786,7789,7788,7791,7790,7793,7792,7795,7794,7797,7796,7799,7798,7801,7800,7803,7802,7805,7804,7807,7806,7809,7808,7811,7810,7813,7812,7815,7814,7817,7816,7819,7818,7821,7820,7823,7822,7825,7824,7827,7826,7829,7828,7835,7776,7841,7840,7843,7842,7845,7844,7847,7846,7849,7848,7851,7850,7853,7852,7855,7854,7857,7856,7859,7858,7861,7860,7863,7862,7865,7864,7867,7866,7869,7868,7871,7870,7873,7872,7875,7874,7877,7876,7879,7878,7881,7880,7883,7882,7885,7884,7887,7886,7889,7888,7891,7890,7893,7892,7895,7894,7897,7896,7899,7898,7901,7900,7903,7902,7905,7904,7907,7906,7909,7908,7911,7910,7913,7912,7915,7914,7917,7916,7919,7918,7921,7920,7923,7922,7925,7924,7927,7926,7929,7928,7931,7930,7933,7932,7935,7934,7936,7944,7937,7945,7938,7946,7939,7947,7940,7948,7941,7949,7942,7950,7943,7951,7952,7960,7953,7961,7954,7962,7955,7963,7956,7964,7957,7965,7968,7976,7969,7977,7970,7978,7971,7979,7972,7980,7973,7981,7974,7982,7975,7983,7984,7992,7985,7993,7986,7994,7987,7995,7988,7996,7989,7997,7990,7998,7991,7999,8000,8008,8001,8009,8002,8010,8003,8011,8004,8012,8005,8013,8017,8025,8019,8027,8021,8029,8023,8031,8032,8040,8033,8041,8034,8042,8035,8043,8036,8044,8037,8045,8038,8046,8039,8047,8048,8122,8049,8123,8050,8136,8051,8137,8052,8138,8053,8139,8054,8154,8055,8155,8056,8184,8057,8185,8058,8170,8059,8171,8060,8186,8061,8187,8064,8072,8065,8073,8066,8074,8067,8075,8068,8076,8069,8077,8070,8078,8071,8079,8080,8088,8081,8089,8082,8090,8083,8091,8084,8092,8085,8093,8086,8094,8087,8095,8096,8104,8097,8105,8098,8106,8099,8107,8100,8108,8101,8109,8102,8110,8103,8111,8112,8120,8113,8121,8115,8124,8126,921,8131,8140,8144,8152,8145,8153,8160,8168,8161,8169,8165,8172,8179,8188,8526,8498,8560,8544,8561,8545,8562,8546,8563,8547,8564,8548,8565,8549,8566,8550,8567,8551,8568,8552,8569,8553,8570,8554,8571,8555,8572,8556,8573,8557,8574,8558,8575,8559,8580,8579,9424,9398,9425,9399,9426,9400,9427,9401,9428,9402,9429,9403,9430,9404,9431,9405,9432,9406,9433,9407,9434,9408,9435,9409,9436,9410,9437,9411,9438,9412,9439,9413,9440,9414,9441,9415,9442,9416,9443,9417,9444,9418,9445,9419,9446,9420,9447,9421,9448,9422,9449,9423,11312,11264,11313,11265,11314,11266,11315,11267,11316,11268,11317,11269,11318,11270,11319,11271,11320,11272,11321,11273,11322,11274,11323,11275,11324,11276,11325,11277,11326,11278,11327,11279,11328,11280,11329,11281,11330,11282,11331,11283,11332,11284,11333,11285,11334,11286,11335,11287,11336,11288,11337,11289,11338,11290,11339,11291,11340,11292,11341,11293,11342,11294,11343,11295,11344,11296,11345,11297,11346,11298,11347,11299,11348,11300,11349,11301,11350,11302,11351,11303,11352,11304,11353,11305,11354,11306,11355,11307,11356,11308,11357,11309,11358,11310,11361,11360,11365,570,11366,574,11368,11367,11370,11369,11372,11371,11379,11378,11382,11381,11393,11392,11395,11394,11397,11396,11399,11398,11401,11400,11403,11402,11405,11404,11407,11406,11409,11408,11411,11410,11413,11412,11415,11414,11417,11416,11419,11418,11421,11420,11423,11422,11425,11424,11427,11426,11429,11428,11431,11430,11433,11432,11435,11434,11437,11436,11439,11438,11441,11440,11443,11442,11445,11444,11447,11446,11449,11448,11451,11450,11453,11452,11455,11454,11457,11456,11459,11458,11461,11460,11463,11462,11465,11464,11467,11466,11469,11468,11471,11470,11473,11472,11475,11474,11477,11476,11479,11478,11481,11480,11483,11482,11485,11484,11487,11486,11489,11488,11491,11490,11500,11499,11502,11501,11520,4256,11521,4257,11522,4258,11523,4259,11524,4260,11525,4261,11526,4262,11527,4263,11528,4264,11529,4265,11530,4266,11531,4267,11532,4268,11533,4269,11534,4270,11535,4271,11536,4272,11537,4273,11538,4274,11539,4275,11540,4276,11541,4277,11542,4278,11543,4279,11544,4280,11545,4281,11546,4282,11547,4283,11548,4284,11549,4285,11550,4286,11551,4287,11552,4288,11553,4289,11554,4290,11555,4291,11556,4292,11557,4293,42561,42560,42563,42562,42565,42564,42567,42566,42569,42568,42571,42570,42573,42572,42575,42574,42577,42576,42579,42578,42581,42580,42583,42582,42585,42584,42587,42586,42589,42588,42591,42590,42593,42592,42595,42594,42597,42596,42599,42598,42601,42600,42603,42602,42605,42604,42625,42624,42627,42626,42629,42628,42631,42630,42633,42632,42635,42634,42637,42636,42639,42638,42641,42640,42643,42642,42645,42644,42647,42646,42787,42786,42789,42788,42791,42790,42793,42792,42795,42794,42797,42796,42799,42798,42803,42802,42805,42804,42807,42806,42809,42808,42811,42810,42813,42812,42815,42814,42817,42816,42819,42818,42821,42820,42823,42822,42825,42824,42827,42826,42829,42828,42831,42830,42833,42832,42835,42834,42837,42836,42839,42838,42841,42840,42843,42842,42845,42844,42847,42846,42849,42848,42851,42850,42853,42852,42855,42854,42857,42856,42859,42858,42861,42860,42863,42862,42874,42873,42876,42875,42879,42878,42881,42880,42883,42882,42885,42884,42887,42886,42892,42891,42897,42896,42913,42912,42915,42914,42917,42916,42919,42918,42921,42920,65345,65313,65346,65314,65347,65315,65348,65316,65349,65317,65350,65318,65351,65319,65352,65320,65353,65321,65354,65322,65355,65323,65356,65324,65357,65325,65358,65326,65359,65327,65360,65328,65361,65329,65362,65330,65363,65331,65364,65332,65365,65333,65366,65334,65367,65335,65368,65336,65369,65337,65370,65338,66600,66560,66601,66561,66602,66562,66603,66563,66604,66564,66605,66565,66606,66566,66607,66567,66608,66568,66609,66569,66610,66570,66611,66571,66612,66572,66613,66573,66614,66574,66615,66575,66616,66576,66617,66577,66618,66578,66619,66579,66620,66580,66621,66581,66622,66582,66623,66583,66624,66584,66625,66585,66626,66586,66627,66587,66628,66588,66629,66589,66630,66590,66631,66591,66632,66592,66633,66593,66634,66594,66635,66595,66636,66596,66637,66597,66638,66598,66639,66599];
var h$toLowerMapping = [65,97,66,98,67,99,68,100,69,101,70,102,71,103,72,104,73,105,74,106,75,107,76,108,77,109,78,110,79,111,80,112,81,113,82,114,83,115,84,116,85,117,86,118,87,119,88,120,89,121,90,122,192,224,193,225,194,226,195,227,196,228,197,229,198,230,199,231,200,232,201,233,202,234,203,235,204,236,205,237,206,238,207,239,208,240,209,241,210,242,211,243,212,244,213,245,214,246,216,248,217,249,218,250,219,251,220,252,221,253,222,254,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,105,306,307,308,309,310,311,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,255,377,378,379,380,381,382,385,595,386,387,388,389,390,596,391,392,393,598,394,599,395,396,398,477,399,601,400,603,401,402,403,608,404,611,406,617,407,616,408,409,412,623,413,626,415,629,416,417,418,419,420,421,422,640,423,424,425,643,428,429,430,648,431,432,433,650,434,651,435,436,437,438,439,658,440,441,444,445,452,454,453,454,455,457,456,457,458,460,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,497,499,498,499,500,501,502,405,503,447,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,539,540,541,542,543,544,414,546,547,548,549,550,551,552,553,554,555,556,557,558,559,560,561,562,563,570,11365,571,572,573,410,574,11366,577,578,579,384,580,649,581,652,582,583,584,585,586,587,588,589,590,591,880,881,882,883,886,887,902,940,904,941,905,942,906,943,908,972,910,973,911,974,913,945,914,946,915,947,916,948,917,949,918,950,919,951,920,952,921,953,922,954,923,955,924,956,925,957,926,958,927,959,928,960,929,961,931,963,932,964,933,965,934,966,935,967,936,968,937,969,938,970,939,971,975,983,984,985,986,987,988,989,990,991,992,993,994,995,996,997,998,999,1000,1001,1002,1003,1004,1005,1006,1007,1012,952,1015,1016,1017,1010,1018,1019,1021,891,1022,892,1023,893,1024,1104,1025,1105,1026,1106,1027,1107,1028,1108,1029,1109,1030,1110,1031,1111,1032,1112,1033,1113,1034,1114,1035,1115,1036,1116,1037,1117,1038,1118,1039,1119,1040,1072,1041,1073,1042,1074,1043,1075,1044,1076,1045,1077,1046,1078,1047,1079,1048,1080,1049,1081,1050,1082,1051,1083,1052,1084,1053,1085,1054,1086,1055,1087,1056,1088,1057,1089,1058,1090,1059,1091,1060,1092,1061,1093,1062,1094,1063,1095,1064,1096,1065,1097,1066,1098,1067,1099,1068,1100,1069,1101,1070,1102,1071,1103,1120,1121,1122,1123,1124,1125,1126,1127,1128,1129,1130,1131,1132,1133,1134,1135,1136,1137,1138,1139,1140,1141,1142,1143,1144,1145,1146,1147,1148,1149,1150,1151,1152,1153,1162,1163,1164,1165,1166,1167,1168,1169,1170,1171,1172,1173,1174,1175,1176,1177,1178,1179,1180,1181,1182,1183,1184,1185,1186,1187,1188,1189,1190,1191,1192,1193,1194,1195,1196,1197,1198,1199,1200,1201,1202,1203,1204,1205,1206,1207,1208,1209,1210,1211,1212,1213,1214,1215,1216,1231,1217,1218,1219,1220,1221,1222,1223,1224,1225,1226,1227,1228,1229,1230,1232,1233,1234,1235,1236,1237,1238,1239,1240,1241,1242,1243,1244,1245,1246,1247,1248,1249,1250,1251,1252,1253,1254,1255,1256,1257,1258,1259,1260,1261,1262,1263,1264,1265,1266,1267,1268,1269,1270,1271,1272,1273,1274,1275,1276,1277,1278,1279,1280,1281,1282,1283,1284,1285,1286,1287,1288,1289,1290,1291,1292,1293,1294,1295,1296,1297,1298,1299,1300,1301,1302,1303,1304,1305,1306,1307,1308,1309,1310,1311,1312,1313,1314,1315,1316,1317,1318,1319,1329,1377,1330,1378,1331,1379,1332,1380,1333,1381,1334,1382,1335,1383,1336,1384,1337,1385,1338,1386,1339,1387,1340,1388,1341,1389,1342,1390,1343,1391,1344,1392,1345,1393,1346,1394,1347,1395,1348,1396,1349,1397,1350,1398,1351,1399,1352,1400,1353,1401,1354,1402,1355,1403,1356,1404,1357,1405,1358,1406,1359,1407,1360,1408,1361,1409,1362,1410,1363,1411,1364,1412,1365,1413,1366,1414,4256,11520,4257,11521,4258,11522,4259,11523,4260,11524,4261,11525,4262,11526,4263,11527,4264,11528,4265,11529,4266,11530,4267,11531,4268,11532,4269,11533,4270,11534,4271,11535,4272,11536,4273,11537,4274,11538,4275,11539,4276,11540,4277,11541,4278,11542,4279,11543,4280,11544,4281,11545,4282,11546,4283,11547,4284,11548,4285,11549,4286,11550,4287,11551,4288,11552,4289,11553,4290,11554,4291,11555,4292,11556,4293,11557,7680,7681,7682,7683,7684,7685,7686,7687,7688,7689,7690,7691,7692,7693,7694,7695,7696,7697,7698,7699,7700,7701,7702,7703,7704,7705,7706,7707,7708,7709,7710,7711,7712,7713,7714,7715,7716,7717,7718,7719,7720,7721,7722,7723,7724,7725,7726,7727,7728,7729,7730,7731,7732,7733,7734,7735,7736,7737,7738,7739,7740,7741,7742,7743,7744,7745,7746,7747,7748,7749,7750,7751,7752,7753,7754,7755,7756,7757,7758,7759,7760,7761,7762,7763,7764,7765,7766,7767,7768,7769,7770,7771,7772,7773,7774,7775,7776,7777,7778,7779,7780,7781,7782,7783,7784,7785,7786,7787,7788,7789,7790,7791,7792,7793,7794,7795,7796,7797,7798,7799,7800,7801,7802,7803,7804,7805,7806,7807,7808,7809,7810,7811,7812,7813,7814,7815,7816,7817,7818,7819,7820,7821,7822,7823,7824,7825,7826,7827,7828,7829,7838,223,7840,7841,7842,7843,7844,7845,7846,7847,7848,7849,7850,7851,7852,7853,7854,7855,7856,7857,7858,7859,7860,7861,7862,7863,7864,7865,7866,7867,7868,7869,7870,7871,7872,7873,7874,7875,7876,7877,7878,7879,7880,7881,7882,7883,7884,7885,7886,7887,7888,7889,7890,7891,7892,7893,7894,7895,7896,7897,7898,7899,7900,7901,7902,7903,7904,7905,7906,7907,7908,7909,7910,7911,7912,7913,7914,7915,7916,7917,7918,7919,7920,7921,7922,7923,7924,7925,7926,7927,7928,7929,7930,7931,7932,7933,7934,7935,7944,7936,7945,7937,7946,7938,7947,7939,7948,7940,7949,7941,7950,7942,7951,7943,7960,7952,7961,7953,7962,7954,7963,7955,7964,7956,7965,7957,7976,7968,7977,7969,7978,7970,7979,7971,7980,7972,7981,7973,7982,7974,7983,7975,7992,7984,7993,7985,7994,7986,7995,7987,7996,7988,7997,7989,7998,7990,7999,7991,8008,8000,8009,8001,8010,8002,8011,8003,8012,8004,8013,8005,8025,8017,8027,8019,8029,8021,8031,8023,8040,8032,8041,8033,8042,8034,8043,8035,8044,8036,8045,8037,8046,8038,8047,8039,8072,8064,8073,8065,8074,8066,8075,8067,8076,8068,8077,8069,8078,8070,8079,8071,8088,8080,8089,8081,8090,8082,8091,8083,8092,8084,8093,8085,8094,8086,8095,8087,8104,8096,8105,8097,8106,8098,8107,8099,8108,8100,8109,8101,8110,8102,8111,8103,8120,8112,8121,8113,8122,8048,8123,8049,8124,8115,8136,8050,8137,8051,8138,8052,8139,8053,8140,8131,8152,8144,8153,8145,8154,8054,8155,8055,8168,8160,8169,8161,8170,8058,8171,8059,8172,8165,8184,8056,8185,8057,8186,8060,8187,8061,8188,8179,8486,969,8490,107,8491,229,8498,8526,8544,8560,8545,8561,8546,8562,8547,8563,8548,8564,8549,8565,8550,8566,8551,8567,8552,8568,8553,8569,8554,8570,8555,8571,8556,8572,8557,8573,8558,8574,8559,8575,8579,8580,9398,9424,9399,9425,9400,9426,9401,9427,9402,9428,9403,9429,9404,9430,9405,9431,9406,9432,9407,9433,9408,9434,9409,9435,9410,9436,9411,9437,9412,9438,9413,9439,9414,9440,9415,9441,9416,9442,9417,9443,9418,9444,9419,9445,9420,9446,9421,9447,9422,9448,9423,9449,11264,11312,11265,11313,11266,11314,11267,11315,11268,11316,11269,11317,11270,11318,11271,11319,11272,11320,11273,11321,11274,11322,11275,11323,11276,11324,11277,11325,11278,11326,11279,11327,11280,11328,11281,11329,11282,11330,11283,11331,11284,11332,11285,11333,11286,11334,11287,11335,11288,11336,11289,11337,11290,11338,11291,11339,11292,11340,11293,11341,11294,11342,11295,11343,11296,11344,11297,11345,11298,11346,11299,11347,11300,11348,11301,11349,11302,11350,11303,11351,11304,11352,11305,11353,11306,11354,11307,11355,11308,11356,11309,11357,11310,11358,11360,11361,11362,619,11363,7549,11364,637,11367,11368,11369,11370,11371,11372,11373,593,11374,625,11375,592,11376,594,11378,11379,11381,11382,11390,575,11391,576,11392,11393,11394,11395,11396,11397,11398,11399,11400,11401,11402,11403,11404,11405,11406,11407,11408,11409,11410,11411,11412,11413,11414,11415,11416,11417,11418,11419,11420,11421,11422,11423,11424,11425,11426,11427,11428,11429,11430,11431,11432,11433,11434,11435,11436,11437,11438,11439,11440,11441,11442,11443,11444,11445,11446,11447,11448,11449,11450,11451,11452,11453,11454,11455,11456,11457,11458,11459,11460,11461,11462,11463,11464,11465,11466,11467,11468,11469,11470,11471,11472,11473,11474,11475,11476,11477,11478,11479,11480,11481,11482,11483,11484,11485,11486,11487,11488,11489,11490,11491,11499,11500,11501,11502,42560,42561,42562,42563,42564,42565,42566,42567,42568,42569,42570,42571,42572,42573,42574,42575,42576,42577,42578,42579,42580,42581,42582,42583,42584,42585,42586,42587,42588,42589,42590,42591,42592,42593,42594,42595,42596,42597,42598,42599,42600,42601,42602,42603,42604,42605,42624,42625,42626,42627,42628,42629,42630,42631,42632,42633,42634,42635,42636,42637,42638,42639,42640,42641,42642,42643,42644,42645,42646,42647,42786,42787,42788,42789,42790,42791,42792,42793,42794,42795,42796,42797,42798,42799,42802,42803,42804,42805,42806,42807,42808,42809,42810,42811,42812,42813,42814,42815,42816,42817,42818,42819,42820,42821,42822,42823,42824,42825,42826,42827,42828,42829,42830,42831,42832,42833,42834,42835,42836,42837,42838,42839,42840,42841,42842,42843,42844,42845,42846,42847,42848,42849,42850,42851,42852,42853,42854,42855,42856,42857,42858,42859,42860,42861,42862,42863,42873,42874,42875,42876,42877,7545,42878,42879,42880,42881,42882,42883,42884,42885,42886,42887,42891,42892,42893,613,42896,42897,42912,42913,42914,42915,42916,42917,42918,42919,42920,42921,65313,65345,65314,65346,65315,65347,65316,65348,65317,65349,65318,65350,65319,65351,65320,65352,65321,65353,65322,65354,65323,65355,65324,65356,65325,65357,65326,65358,65327,65359,65328,65360,65329,65361,65330,65362,65331,65363,65332,65364,65333,65365,65334,65366,65335,65367,65336,65368,65337,65369,65338,65370,66560,66600,66561,66601,66562,66602,66563,66603,66564,66604,66565,66605,66566,66606,66567,66607,66568,66608,66569,66609,66570,66610,66571,66611,66572,66612,66573,66613,66574,66614,66575,66615,66576,66616,66577,66617,66578,66618,66579,66619,66580,66620,66581,66621,66582,66622,66583,66623,66584,66624,66585,66625,66586,66626,66587,66627,66588,66628,66589,66629,66590,66630,66591,66631,66592,66632,66593,66633,66594,66634,66595,66635,66596,66636,66597,66637,66598,66638,66599,66639];

function h$str(s) {
  var enc = null;
  return function() {
    if(enc === null) {
      enc = h$encodeUtf8(s);
    }
    return enc;
  }
}
function h$rstr(d) {
  var enc = null;
  return function() {
    if(enc === null) {
      enc = h$rawStringData(d);
    }
    return enc;
  }
}
var h$toUpper = null;
function h$u_towupper(ch) {
  if(h$toUpper == null) { h$toUpper = h$decodeMapping(h$toUpperMapping); }
  var r = h$toUpper[ch];
  return (r !== null && r !== undefined) ? r : ch;
}
var h$toLower = null;
function h$u_towlower(ch) {
  if(h$toLower == null) { h$toLower = h$decodeMapping(h$toLowerMapping); }
  var r = h$toLower[ch];
  return (r !== null && r !== undefined) ? r : ch;
}
function h$u_iswspace(ch) {
  return /^\s$/.test(new String(ch)) ? 1 : 0;
}
var h$alpha = null;
function h$u_iswalpha(a) {
  if(h$alpha == null) { h$alpha = h$decodeRle(h$alphaRanges); }
  return h$alpha[a] == 1 ? 1 : 0;
}
var h$alnum = null;
function h$u_iswalnum(a) {
  if(h$alnum == null) { h$alnum = h$decodeRle(h$alnumRanges); }
  return h$alnum[a] == 1 ? 1 : 0;
}
function h$u_iswspace(a) {
    return '\t\n\v\f\r \u0020\u00a0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
        .indexOf(String.fromCharCode(a)) !== -1 ? 1 : 0;
}
var h$lower = null;
function h$u_iswlower(a) {
  if(h$lower == null) { h$lower = h$decodeRle(h$lowerRanges); }
  return h$lower[a] == 1 ? 1 : 0;
}
var h$upper = null;
function h$u_iswupper(a) {
  if(h$upper == null) { h$upper = h$decodeRle(h$upperRanges); }
  return h$upper[a] == 1 ? 1 : 0;
}
var h$cntrl = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159];
function h$u_iswcntrl(a) {
  return (h$cntrl.indexOf(a) !== -1) ? 1 : 0;
}
var h$print = null;
function h$u_iswprint(a) {
  if(h$print == null) { h$print = h$decodeRle(h$printRanges); }
  return h$print[a] === 1 ? 1 : 0;
}
function h$decodeRle(arr) {
  var r = [];
  for(var i=0;i<arr.length;i+=2) {
    var start = arr[i];
    var length = arr[i+1];
    for(var j=start;j<start+length;j++) {
      r[j] = 1;
    }
  }
  return r;
}
function h$decodeMapping(arr) {
  var r = [];
  for(var i=0;i<arr.length;i+=2) {
    var from = arr[i];
    var to = arr[i+1];
    r[from] = to;
  }
  return r;
}
function h$localeEncoding() {
   h$ret1 = 0;
   return h$encodeUtf8("UTF-8");
}
function h$rawStringData(str) {
    var v = h$newByteArray(str.length+1);
    var u8 = v.u8;
    for(var i=0;i<str.length;i++) {
       u8[i] = str[i];
    }
    u8[str.length] = 0;
    return v;
}
function h$encodeUtf8(str) {
  var i, low;
  var n = 0;
  for(i=0;i<str.length;i++) {
    var c = str.charCodeAt(i);
    if (0xD800 <= c && c <= 0xDBFF) {
      low = str.charCodeAt(i+1);
      c = ((c - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
      i++;
    }
    if(c <= 0x7F) {
      n++;
    } else if(c <= 0x7FF) {
      n+=2;
    } else if(c <= 0xFFFF) {
      n+=3;
    } else if(c <= 0x1FFFFF) {
      n+=4;
    } else if(c <= 0x3FFFFFF) {
      n+=5;
    } else {
      n+=6;
    }
  }
  var v = h$newByteArray(n+1);
  var u8 = v.u8;
  n = 0;
  for(i=0;i<str.length;i++) {
    var c = str.charCodeAt(i);
    if (0xD800 <= c && c <= 0xDBFF) {
      low = str.charCodeAt(i+1);
      c = ((c - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
      i++;
    }
    if(c <= 0x7F) {
      u8[n] = c;
      n++;
    } else if(c <= 0x7FF) {
      u8[n] = (c >> 6) | 0xC0;
      u8[n+1] = (c & 0x3F) | 0x80;
      n+=2;
    } else if(c <= 0xFFFF) {
      u8[n] = (c >> 12) | 0xE0;
      u8[n+1] = ((c >> 6) & 0x3F) | 0x80;
      u8[n+2] = (c & 0x3F) | 0x80;
      n+=3;
    } else if(c <= 0x1FFFFF) {
      u8[n] = (c >> 18) | 0xF0;
      u8[n+1] = ((c >> 12) & 0x3F) | 0x80;
      u8[n+2] = ((c >> 6) & 0x3F) | 0x80;
      u8[n+3] = (c & 0x3F) | 0x80;
      n+=4;
    } else if(c <= 0x3FFFFFF) {
      u8[n] = (c >> 24) | 0xF8;
      u8[n+1] = ((c >> 18) & 0x3F) | 0x80;
      u8[n+2] = ((c >> 12) & 0x3F) | 0x80;
      u8[n+3] = ((c >> 6) & 0x3F) | 0x80;
      u8[n+4] = (c & 0x3F) | 0x80;
      n+=5;
    } else {
      u8[n] = (c >>> 30) | 0xFC;
      u8[n+1] = ((c >> 24) & 0x3F) | 0x80;
      u8[n+2] = ((c >> 18) & 0x3F) | 0x80;
      u8[n+3] = ((c >> 12) & 0x3F) | 0x80;
      u8[n+4] = ((c >> 6) & 0x3F) | 0x80;
      u8[n+5] = (c & 0x3F) | 0x80;
      n+=6;
    }
  }
  u8[v.len-1] = 0;
  return v;
}
function h$encodeUtf16(str) {
  var n = 0;
  var i;
  for(i=0;i<str.length;i++) {
    var c = str.charCodeAt(i);
    if(c <= 0xFFFF) {
      n += 2;
    } else {
      n += 4;
    }
  }
  var v = h$newByteArray(n+1);
  var dv = v.dv;
  n = 0;
  for(i=0;i<str.length;i++) {
    var c = str.charCodeAt(i);
    if(c <= 0xFFFF) {
      dv.setUint16(n, c, true);
      n+=2;
    } else {
      var c0 = c - 0x10000;
      dv.setUint16(n, c0 >> 10, true);
      dv.setUint16(n+2, c0 & 0x3FF, true);
      n+=4;
    }
  }
  dv.setUint8(v.len-1,0);
  return v;
}
function h$fromStr(s) {
  var l = s.length;
  var b = h$newByteArray(l * 2);
  var dv = b.dv;
  for(var i=l-1;i>=0;i--) {
    dv.setUint16(i<<1, s.charCodeAt(i), true);
  }
  h$ret1 = l;
  return b;
}
function h$toStr(b,o,l) {
  var a = [];
  var end = 2*(o+l);
  var k = 0;
  var dv = b.dv;
  for(var i=2*o;i<end;i+=2) {
    var cc = dv.getUint16(i,true);
    a[k++] = cc;
  }
  return String.fromCharCode.apply(this, a);
}
function h$decodeUtf16l(v, byteLen, start) {
  var a = [];
  for(var i=0;i<byteLen;i+=2) {
    a[i>>1] = v.dv.getUint16(i+start,true);
  }
  return String.fromCharCode.apply(this, a);
}
var h$dU16 = h$decodeUtf16;
function h$decodeUtf8z(v,start) {
  var n = start;
  var max = v.len;
  while(n < max) {
    if(v.u8[n] === 0) { break; }
    n++;
  }
  return h$decodeUtf8(v,n,start);
}
function h$decodeUtf8(v,n0,start) {
  var n = n0 || v.len;
  var arr = [];
  var i = start || 0;
  var code;
  var u8 = v.u8;
  while(i < n) {
    var c = u8[i];
    while((c & 0xC0) === 0x80) {
      c = u8[++i];
    }
    if((c & 0x80) === 0) {
      code = (c & 0x7F);
      i++;
    } else if((c & 0xE0) === 0xC0) {
      code = ( ((c & 0x1F) << 6)
             | (u8[i+1] & 0x3F)
             );
      i+=2;
    } else if((c & 0xF0) === 0xE0) {
      code = ( ((c & 0x0F) << 12)
             | ((u8[i+1] & 0x3F) << 6)
             | (u8[i+2] & 0x3F)
             );
      i+=3;
    } else if ((c & 0xF8) === 0xF0) {
      code = ( ((c & 0x07) << 18)
             | ((u8[i+1] & 0x3F) << 12)
             | ((u8[i+2] & 0x3F) << 6)
             | (u8[i+3] & 0x3F)
             );
      i+=4;
    } else if((c & 0xFC) === 0xF8) {
      code = ( ((c & 0x03) << 24)
             | ((u8[i+1] & 0x3F) << 18)
             | ((u8[i+2] & 0x3F) << 12)
             | ((u8[i+3] & 0x3F) << 6)
             | (u8[i+4] & 0x3F)
             );
      i+=5;
    } else {
      code = ( ((c & 0x01) << 30)
             | ((u8[i+1] & 0x3F) << 24)
             | ((u8[i+2] & 0x3F) << 18)
             | ((u8[i+3] & 0x3F) << 12)
             | ((u8[i+4] & 0x3F) << 6)
             | (u8[i+5] & 0x3F)
             );
      i+=6;
    }
    if(code > 0xFFFF) {
      var offset = code - 0x10000;
      arr.push(0xD800 + (offset >> 10), 0xDC00 + (offset & 0x3FF));
    } else {
      arr.push(code);
    }
  }
  return String.fromCharCode.apply(this, arr);
}
function h$decodeUtf16(v) {
  var n = v.len;
  var arr = [];
  var dv = v.dv;
  for(var i=0;i<n;i+=2) {
    arr.push(dv.getUint16(i,true));
  }
  return String.fromCharCode.apply(this, arr);
}
function h$hs_iconv_open(to,to_off,from,from_off) {
  h$errno = h$EINVAL;
  return -1;
}
function h$hs_iconv_close(iconv) {
  return 0;
}
function h$hs_iconv(iconv, inbuf, inbuf_off, insize, insize_off,
                           outbuf, outbuf_off, outsize, outsize_off) {
  return utf32leToUtf8(inbuf, inbuf_off, insize, insize_off,
                       outbuf, outbuf_off, outsize, outsize_off);
}
function h$derefPtrA(ptr, ptr_off) {
  return ptr.arr[ptr_off][0];
}
function h$derefPtrO(ptr, ptr_off) {
  return ptr.arr[ptr_off][1];
}
function h$readPtrPtrU32(ptr, ptr_off, x, y) {
  x = x || 0;
  y = y || 0;
  var arr = ptr.arr[ptr_off + 4 * x];
  return arr[0].dv.getInt32(arr[1] + 4 * y, true);
}
function h$readPtrPtrU8(ptr, ptr_off, x, y) {
  x = x || 0;
  y = y || 0;
  var arr = ptr.arr[ptr_off + 4 * x];
  return arr[0].dv.getUint8(arr[1] + y);
}
function h$writePtrPtrU32(ptr, ptr_off, v, x, y) {
  x = x || 0;
  y = y || 0;
  var arr = ptr.arr[ptr_off + 4 * x];
  arr[0].dv.putInt32(arr[1] + y, v);
}
function h$writePtrPtrU8(ptr, ptr_off, v, x, y) {
  x = x || 0;
  y = y || 0;
  var arr = ptr.arr[ptr_off+ 4 * x];
  arr[0].dv.putUint8(arr[1] + y, v);
}
function h$cl(arr) {
  var r = h$ghczmprimZCGHCziTypesziZMZN;
  var i = arr.length - 1;
  while(i>=0) {
    r = h$c2(h$ghczmprimZCGHCziTypesziZC_con_e, arr[i], r);
    --i;
  }
  return r;
}
function h$clr(arr, r) {
  var i = arr.length - 1;
  while(i>=0) {
    r = h$c2(h$ghczmprimZCGHCziTypesziZC_con_e, arr[i], r);
    --i;
  }
  return r;
}
function h$toHsString(str) {
  var i = str.length - 1;
  var r = h$ghczmprimZCGHCziTypesziZMZN;
  while(i>=0) {
    var cp = str.charCodeAt(i);
    if(cp >= 0xDC00 && cp <= 0xDFFF && i > 0) {
      --i;
      cp = (cp - 0xDC00) + (str.charCodeAt(i) - 0xD800) * 1024 + 0x10000;
    }
    r = h$c2(h$ghczmprimZCGHCziTypesziZC_con_e, cp, r);
    --i;
  }
  return r;
}
function h$toHsStringA(str) {
  var i = str.length - 1;
  var r = h$ghczmprimZCGHCziTypesziZMZN;
  while(i>=0) {
    r = h$c2(h$ghczmprimZCGHCziTypesziZC_con_e, str.charCodeAt(i), r);
    --i;
  }
  return r;
}
function h$appendToHsStringA(str, appendTo) {
  var i = str.length - 1;
  var r = appendTo;
  while(i>=0) {
    r = h$c2(h$ghczmprimZCGHCziTypesziZC_con_e, str.charCodeAt(i), r);
    --i;
  }
  return r;
}
function h$throwJSException(e) {
  var jsE = h$c2(h$ghcjszmprimZCGHCJSziPrimziJSException_con_e,e,h$toHsString(e.toString()));
  var someE = h$c2(h$baseZCGHCziExceptionziSomeException_con_e,
     h$ghcjszmprimZCGHCJSziPrimzizdfExceptionJSException, jsE);
  return h$throw(someE, true);
}

BigInteger.prototype.am = am3;
dbits = 28;
DV = (1<<dbits);
BigInteger.prototype.DB = dbits;
BigInteger.prototype.DM = ((1<<dbits)-1);
BigInteger.prototype.DV = (1<<dbits);
var BI_FP = 52;
BigInteger.prototype.FV = Math.pow(2,BI_FP);
BigInteger.prototype.F1 = BI_FP-dbits;
BigInteger.prototype.F2 = 2*dbits-BI_FP;
h$bigZero = nbv(0);
h$bigOne = nbv(1);
h$bigCache = [];
for(var i=0;i<=100;i++) {
  h$bigCache.push(nbv(i));
}
function h$bigFromInt(v) {
  ;
  var v0 = v|0;
  if(v0 >= 0) {
    if(v0 <= 100) {
      return h$bigCache[v0];
    } else if(v0 < 268435456) {
      return nbv(v0);
    }
    var r1 = nbv(v0 >>> 16);
    var r2 = nbi();
    r1.lShiftTo(16,r2);
    r1.fromInt(v0 & 0xffff);
    var r3 = r1.or(r2);
    ;
    return r3;
  } else {
    v0 = -v0;
    if(v0 < 268435456) {
      return nbv(v0).negate();
    }
    var r1 = nbv(v0 >>> 16);
    var r2 = nbi();
    r1.lShiftTo(16,r2);
    r1.fromInt(v0 & 0xffff);
    var r3 = r1.or(r2);
    BigInteger.ZERO.subTo(r3,r2);
    ;
    return r2;
  }
}
function h$bigFromWord(v) {
  var v0 = v|0;
  if(v0 >= 0) {
    if(v0 <= 100) {
      return h$bigCache[v0];
    } else if(v0 < 268435456) {
      return nbv(v0);
    }
  }
  var r1 = nbv(v0 >>> 16);
  var r2 = nbv(0);
  r1.lShiftTo(16,r2);
  r1.fromInt(v0 & 0xffff);
  return r1.or(r2);
}
function h$bigFromInt64(v1,v2) {
  ;
  var v10 = v1|0;
  var v20 = v2|0;
  var r = new BigInteger([ v10 >> 24, (v10 & 0xff0000) >> 16, (v10 & 0xff00) >> 8, v10 & 0xff
                         , v20 >>> 24, (v20 & 0xff0000) >> 16, (v20 & 0xff00) >> 8, v20 & 0xff
                         ]);
  ;
  return r;
}
function h$bigFromWord64(v1,v2) {
  ;
  var v10 = v1|0;
  var v20 = v2|0;
  var arr = [ 0, v10 >>> 24, (v10 & 0xff0000) >> 16, (v10 & 0xff00) >> 8, v10 & 0xff
                         , v20 >>> 24, (v20 & 0xff0000) >> 16, (v20 & 0xff00) >> 8, v20 & 0xff
                         ];
  ;
  var r = new BigInteger([ 0, v10 >>> 24, (v10 & 0xff0000) >> 16, (v10 & 0xff00) >> 8, v10 & 0xff
                         , v20 >>> 24, (v20 & 0xff0000) >> 16, (v20 & 0xff00) >> 8, v20 & 0xff
                         ]);
  ;
  return r;
}
function h$bigFromNumber(n) {
  var ra = [];
  var s = 0;
  if(n < 0) {
    n = -n;
    s = -1;
  }
  var b = 1;
  while(n >= b) {
    ra.unshift((n/b)&0xff);
    b *= 256;
  }
  ra.unshift(s);
  return new BigInteger(ra);
}
function h$encodeNumber(big,e) {
  var m = Math.pow(2,e);
  if(m === Infinity) {
    switch(big.signum()) {
      case 1: return Infinity;
      case 0: return 0;
      default: return -Infinity;
    }
  }
  var b = big.toByteArray();
  var l = b.length;
  var r = 0;
  ;
  for(var i=l-1;i>=1;i--) {
  ;
    r += m * Math.pow(2,(l-i-1)*8) * (b[i] & 0xff);
    ;
  }
  if(b[0] != 0) {
    r += m * Math.pow(2,(l-1)*8) * b[0];
  }
  ;
  return r;
}
function h$integer_cmm_cmpIntegerzh(sa, abits, sb, bbits) {
  ;
  var c = abits.compareTo(bbits);
  return c == 0 ? 0 : c > 0 ? 1 : -1;
}
function h$integer_cmm_cmpIntegerIntzh(sa, abits, b) {
  ;
  var c = abits.compareTo(h$bigFromInt(b));
  return c == 0 ? 0 : c > 0 ? 1 : -1;
}
function h$integer_cmm_plusIntegerzh(sa, abits, sb, bbits) {
    ;
    return abits.add(bbits);
}
function h$integer_cmm_plusIntegerIntzh(sa, abits, b) {
  ;
  return abits.add(h$bigFromInt(b));
}
function h$integer_cmm_minusIntegerzh(sa, abits, sb, bbits) {
    ;
    return abits.subtract(bbits);
}
function h$integer_cmm_minusIntegerIntzh(sa, abits, b) {
   ;
   return abits.subtract(h$bigFromInt(b));
}
function h$integer_cmm_timesIntegerzh(sa, abits, sb, bbits) {
    ;
    return abits.multiply(bbits);
}
function h$integer_cmm_timesIntegerIntzh(sa, abits, b) {
  ;
  return abits.multiply(h$bigFromInt(b));
}
function h$integer_cmm_quotRemIntegerzh(sa, abits, sb, bbits) {
    ;
    var q = abits.divide(bbits);
    ;
    var r = abits.subtract(q.multiply(bbits));
    ;
    h$ret1 = r;
    return q;
}
function h$integer_cmm_quotRemIntegerWordzh(sa, abits, b) {
    var bbits = h$bigFromWord(b);
    ;
    var q = abits.divide(bbits);
    h$ret1 = abits.subtract(q.multiply(bbits));
    return q;
}
function h$integer_cmm_quotIntegerzh(sa, abits, sb, bbits) {
    ;
    return abits.divide(bbits);
}
function h$integer_cmm_quotIntegerWordzh(sa, abits, b) {
    ;
    return abits.divide(h$bigFromWord(b));
}
function h$integer_cmm_remIntegerzh(sa, abits, sb, bbits) {
    ;
    return abits.subtract(bbits.multiply(abits.divide(bbits)));
}
function h$integer_cmm_remIntegerWordzh(sa, abits, b) {
    ;
    var bbits = h$bigFromWord(b);
    return abits.subtract(bbits.multiply(abits.divide(bbits)));
}
function h$integer_cmm_divModIntegerzh(sa, abits, sb, bbits) {
    ;
    var d = abits.divide(bbits);
    var m = abits.subtract(d.multiply(bbits));
    if(abits.signum()!==bbits.signum() && m.signum() !== 0) {
        d = d.subtract(h$bigOne);
        m.addTo(bbits, m);
    }
    h$ret1 = m;
    return d;
}
function h$integer_cmm_divModIntegerWordzh(sa, abits, b) {
    ;
    return h$integer_cmm_divModIntegerWordzh(sa, abits, 0, h$bigFromWord(b));
}
function h$integer_cmm_divIntegerzh(sa, abits, sb, bbits) {
    ;
    var d = abits.divide(bbits);
    var m = abits.subtract(d.multiply(bbits));
    if(abits.signum()!==bbits.signum() && m.signum() !== 0) {
        d = d.subtract(h$bigOne);
    }
    return d;
}
function h$integer_cmm_divIntegerWordzh(sa, abits, b) {
    ;
    return h$integer_cmm_divIntegerzh(sa, abits, 0, h$bigFromWord(b));
}
function h$integer_cmm_modIntegerzh(sa, abits, sb, bbits) {
    ;
    var d = abits.divide(bbits);
    var m = abits.subtract(d.multiply(bbits));
    if(abits.signum()!==bbits.signum() && m.signum() !== 0) {
        m.addTo(bbits, m);
    }
    return m;
}
function h$integer_cmm_modIntegerWordzh(sa, abits, b) {
    ;
    return h$integer_cmm_modIntegerzh(sa, abits, 0, h$bigFromWord(b));
}
function h$integer_cmm_divExactIntegerzh(sa, abits, sb, bbits) {
    ;
    return abits.divide(bbits);
}
function h$integer_cmm_divExactIntegerWordzh(sa, abits, b) {
    ;
    return abits.divide(h$bigFromWord(b));
}
function h$gcd(a, b) {
    var x = a.abs();
    var y = b.abs();
    var big, small;
    if(x.compareTo(y) < 0) {
        small = x;
        big = y;
    } else {
        small = y;
        big = x;
    }
    while(small.signum() !== 0) {
        var q = big.divide(small);
        var r = big.subtract(q.multiply(small));
        big = small;
        small = r;
    }
    return big;
}
function h$integer_cmm_gcdIntegerzh(sa, abits, sb, bbits) {
    ;
    return h$gcd(abits, bbits);
}
function h$integer_cmm_gcdIntegerIntzh(sa, abits, b) {
    ;
    var r = h$gcd(abits, h$bigFromInt(b));
    return r.intValue();
}
function h$integer_cmm_gcdIntzh(a, b) {
        var x = a<0 ? -a : a;
        var y = b<0 ? -b : b;
        var big, small;
        if(x<y) {
            small = x;
            big = y;
        } else {
            small = y;
            big = x;
        }
        while(small!==0) {
            var r = big % small;
            big = small;
            small = r;
        }
        return big;
}
function h$integer_cmm_powIntegerzh(sa, abits, b) {
    ;
    if(b >= 0) {
      return abits.pow(b);
    } else {
      return abits.pow(b + 2147483648);
    }
}
function h$integer_cmm_powModIntegerzh(sa, abits, sb, bbits, sc, cbits) {
    ;
    return abits.modPow(bbits, cbits);
}
function h$integer_cmm_powModSecIntegerzh(sa, abits, sb, bbits, sc, cbits) {
    ;
    return h$integer_cmm_powModIntegerzh(sa, abits, sb, bbits, sc, cbits);
}
function h$integer_cmm_recipModIntegerzh(sa, abits, sb, bbits) {
    ;
    return abits.modInverse(bbits);
}
function h$integer_cmm_nextPrimeIntegerzh(sa, abits) {
    ;
    var n = abits.add(BigInteger.ONE);
    while(true) {
      if(n.isProbablePrime(50)) return n;
      n.addTo(BigInteger.ONE, n);
    }
}
function h$integer_cmm_testPrimeIntegerzh(sa, abits, b) {
    ;
    return abits.isProbablePrime(b) ? 1 : 0;
}
function h$integer_cmm_sizeInBasezh(sa, abits, b) {
    ;
    return Math.ceil(abits.bitLength() * Math.log(2) / Math.log(b));
}
var h$oneOverLog2 = 1 / Math.log(2);
function h$integer_cmm_decodeDoublezh(x) {
    ;
    if(isNaN(x)) {
      h$ret1 = h$bigFromInt(3).shiftLeft(51).negate();
      return 972;
    }
    if( x < 0 ) {
        var result = h$integer_cmm_decodeDoublezh(-x);
        h$ret1 = h$ret1.negate();
        return result;
    }
    if(x === Number.POSITIVE_INFINITY) {
        h$ret1 = h$bigOne.shiftLeft(52);
        return 972;
    }
    var exponent = (Math.floor(Math.log(x) * h$oneOverLog2)-52)|0;
    var n;
    if(exponent < -1000) {
      n = x * Math.pow(2,-exponent-128) * Math.pow(2,128);
    } else if(exponent > 900) {
      n = x * Math.pow(2,-exponent+128) * Math.pow(2,-128);
    } else {
      n = x * Math.pow(2,-exponent);
    }
    if(Math.abs(n - Math.floor(n) - 0.5) < 0.0001) {
      exponent--;
      n *= 2;
    }
    h$ret1 = h$bigFromNumber(n);
    return exponent;
}
function h$integer_cmm_int2Integerzh(i) {
    ;
    h$ret1 = h$bigFromInt(i);
    return 0;
}
function h$integer_cmm_word2Integerzh(i) {
    ;
    h$ret1 = h$bigFromWord(i);
    return 0;
}
function h$integer_cmm_andIntegerzh(sa, abits, sb, bbits) {
    ;
    return abits.and(bbits);
}
function h$integer_cmm_orIntegerzh(sa, abits, sb, bbits) {
    ;
    return abits.or(bbits);
}
function h$integer_cmm_xorIntegerzh(sa, abits, sb, bbits) {
    ;
    return abits.xor(bbits);
}
function h$integer_cmm_testBitIntegerzh(sa, abits, bit) {
    return abits.testBit(bit)?1:0;
}
function h$integer_cmm_mul2ExpIntegerzh(sa, abits, b) {
    ;
    return abits.shiftLeft(b);
}
function h$integer_cmm_fdivQ2ExpIntegerzh(sa, abits, b) {
    ;
    return abits.shiftRight(b);
}
function h$integer_cmm_complementIntegerzh(sa, abits) {
    ;
    return abits.not();
}
function h$integer_cmm_int64ToIntegerzh(a0, a1) {
    ;
    h$ret1 = h$bigFromInt64(a0,a1);
    return 0;
}
function h$integer_cmm_word64ToIntegerzh(a0, a1) {
    ;
    h$ret1 = h$bigFromWord64(a0,a1);
    return 0;
}
function h$hs_integerToInt64(as, abits) {
    ;
    h$ret1 = abits.intValue();
    return abits.shiftRight(32).intValue();
}
function h$hs_integerToWord64(as, abits) {
    ;
    h$ret1 = abits.intValue();
    return abits.shiftRight(32).intValue();
}
function h$integer_cmm_integer2Intzh(as, abits) {
   ;
   return abits.intValue();
}
function h$integer_cbits_encodeDouble(as,abits,e) {
    ;
   return h$encodeNumber(abits,e);
}
function h$integer_cbits_encodeFloat(as,abits,e) {
    ;
   return h$encodeNumber(abits,e);
}
function h$__int_encodeDouble(i,e) {
   return i * Math.pow(2,e);
}
function h$__int_encodeFloat(i,e) {
   return i * Math.pow(2,e);
}

var h$glbl;
function h$getGlbl() { h$glbl = this; }
h$getGlbl();
function h$log() {
  if(h$glbl) {
    if(h$glbl.console && h$glbl.console.log) {
      h$glbl.console.log.apply(h$glbl.console,arguments);
    } else {
      h$glbl.print.apply(this,arguments);
    }
  } else {
    print.apply(this, arguments);
  }
  if(typeof(jQuery) !== 'undefined') {
    var x = '';
    for(var i=0;i<arguments.length;i++) { x = x + arguments[i]; }
    var xd = jQuery("<div></div>");
    xd.text(x);
    jQuery('#output').append(xd);
  }
}
function h$collectProps(o) {
  var props = [];
  for(var p in o) { props.push(p); }
  return("{"+props.join(",")+"}");
}
var h$programArgs;
if(typeof scriptArgs !== 'undefined') {
  h$programArgs = scriptArgs.slice(0);
  h$programArgs.unshift("a.js");
} else if(typeof process !== 'undefined' && process.argv) {
  h$programArgs = process.argv.slice(1);
} else if(typeof arguments !== 'undefined') {
  h$programArgs = arguments.slice(0);
  h$programArgs.unshift("a.js");
} else {
  h$programArgs = [ "a.js" ];
}
function h$getProgArgv(argc_v,argc_off,argv_v,argv_off) {
  var c = h$programArgs.length;
  if(c === 0) {
    argc_v.dv.setInt32(argc_off, 0, true);
  } else {
    argc_v.dv.setInt32(argc_off, c, true);
    var argv = h$newByteArray(4*c);
    argv.arr = [];
    for(var i=0;i<h$programArgs.length;i++) {
      argv.arr[4*i] = [ h$encodeUtf8(h$programArgs[i]), 0 ];
    }
    if(!argv_v.arr) { argv_v.arr = []; }
    argv_v.arr[argv_off] = [argv, 0];
  }
}
function h$getpid() {
  if(this['process']) return process.id;
  return 0;
}
function h$__hscore_environ() {
  h$ret1 = 0;
  return null;
}
function h$getenv() {
  h$ret1 = 0;
  return null;
}
function h$errorBelch() {
  h$log("### errorBelch: do we need to handle a vararg function here?");
}
function h$errorBelch2(buf1, buf_offset1, buf2, buf_offset2) {
  h$errorMsg(h$decodeUtf8z(buf1, buf_offset1), h$decodeUtf8z(buf2, buf_offset2));
}
function h$debugBelch2(buf1, buf_offset1, buf2, buf_offset2) {
  h$errorMsg(h$decodeUtf8z(buf1, buf_offset1), h$decodeUtf8z(buf2, buf_offset2));
}
function h$errorMsg(pat) {
  var str = pat;
  for(var i=1;i<arguments.length;i++) {
    str = str.replace(/%s/, arguments[i]);
  }
  if(typeof process !== 'undefined' && process && process.stderr) {
    process.stderr.write(str);
  } else if (typeof printErr !== 'undefined') {
    printErr(str);
  } else if (typeof putstr !== 'undefined') {
    putstr(str);
  } else if(typeof(console) !== 'undefined') {
    console.log(str);
  }
}
function h$performMajorGC() {
  var t = h$currentThread;
  h$sp += 2;
  h$stack[h$sp] = h$return;
  h$stack[h$sp-1] = h$r1;
  t.sp = h$sp;
  h$currentThread = null;
  h$gc(t);
  h$currentThread = t;
  h$stack = t.stack;
  h$r1 = h$stack[t.sp-1];
  h$sp = t.sp-2;
}
function h$baseZCSystemziCPUTimeZCgetrusage() {
  return 0;
}
function h$getrusage() {
  return 0;
}
function h$gettimeofday(tv_v,tv_o,tz_v,tz_o) {
  var now = Date.now();
  tv_v.dv.setInt32(tv_o, (now / 1000)|0, true);
  tv_v.dv.setInt32(tv_o + 4, ((now % 1000) * 1000)|0, true);
  if(tv_v.len >= tv_o + 12) {
    tv_v.dv.setInt32(tv_o + 8, ((now % 1000) * 1000)|0, true);
  }
  return 0;
}
function h$traceEvent(ev_v,ev_o) {
  h$errorMsg(h$decodeUtf8z(ev_v, ev_o));
}
function h$traceMarker(ev_v,ev_o) {
  h$errorMsg(h$decodeUtf8z(ev_v, ev_o));
}
var h$__hscore_gettimeofday = h$gettimeofday;
var h$myTimeZone = h$encodeUtf8("UTC");
function h$localtime_r(timep_v, timep_o, result_v, result_o) {
  var t = timep_v.i3[timep_o];
  var d = new Date(t * 1000);
  result_v.dv.setInt32(result_o , d.getSeconds(), true);
  result_v.dv.setInt32(result_o + 4 , d.getMinutes(), true);
  result_v.dv.setInt32(result_o + 8 , d.getHours(), true);
  result_v.dv.setInt32(result_o + 12, d.getDate(), true);
  result_v.dv.setInt32(result_o + 16, d.getMonth(), true);
  result_v.dv.setInt32(result_o + 20, d.getFullYear()-1900, true);
  result_v.dv.setInt32(result_o + 24, d.getDay(), true);
  result_v.dv.setInt32(result_o + 28, 0, true);
  result_v.dv.setInt32(result_o + 32, -1, true);
  result_v.dv.setInt32(result_o + 40, 0, true);
  if(!result_v.arr) result_v.arr = [];
  result_v.arr[result_o + 40] = [h$myTimeZone, 0];
  result_v.arr[result_o + 48] = [h$myTimeZone, 0];
  h$ret1 = result_o;
  return result_v;
}
var h$__hscore_localtime_r = h$localtime_r;

var h$weaks = new goog.structs.Set();
function h$finalizeWeaks() {
  ;
  var i, w;
  var toFinalize = [];
  var toRemove = [];
  var iter = h$weaks.__iterator__();
  try {
    while(true) {
      w = iter.next();
      ;
      ;
      if(!h$isMarked(w.key)) {
        if(w.finalizer === null) {
          toRemove.push(w);
        } else {
          toFinalize.push(w);
        }
      } else if(!h$isMarked(w) && w.finalizer === null) {
        toRemove.push(w);
      }
    }
  } catch(e) { if(e !== goog.iter.StopIteration) { throw e; } }
  ;
  for(i=0;i<toRemove.length;i++) {
    w = toRemove[i];
    w.key = null;
    w.val = null;
    h$weaks.remove(w);
  }
  ;
  if(toFinalize.length > 0) {
    var t = new h$Thread();
    for(i=0;i<toFinalize.length;i++) {
      w = toFinalize[i];
      t.sp += 6;
      t.stack[t.sp-5] = 0;
      t.stack[t.sp-4] = h$noop;
      t.stack[t.sp-3] = h$catch_e;
      t.stack[t.sp-2] = h$ap_1_0;
      t.stack[t.sp-1] = w.finalizer;
      t.stack[t.sp] = h$return;
      w.key = null;
      w.val = null;
      w.finalizer = null;
      h$weaks.remove(w);
    }
    h$wakeupThread(t);
  }
}
function h$Weak(key, val, finalizer) {
  ;
  if(key.f && key.f.n) { ; }
  this.key = key;
  this.val = val;
  this.finalizer = finalizer;
  h$weaks.add(this);
}
function h$makeWeak(key, val, fin) {
  ;
  return new h$Weak(key, val, fin)
}
function h$makeWeakNoFinalizer(key, val) {
  ;
  return new h$Weak(key, val, null);
}
function h$finalizeWeak(w) {
  ;
  h$weaks.remove(w);
  w.key = null;
  w.val = null;
  if(w.finalizer === null) {
    return 0;
  } else {
    h$ret1 = w.finalizer;
    w.finalizer = null;
    return 1;
  }
}

var h$threadRunning = 0;
var h$threadBlocked = 1;
var h$threadFinished = 16;
var h$threadDied = 17;
var h$threadIdN = 0;
var h$threads = new goog.structs.Queue();
var h$blocked = new goog.structs.Set();
function h$Thread() {
  this.tid = ++h$threadIdN;
  this.status = h$threadRunning;
  this.stack = [h$done, 0, h$baseZCGHCziConcziSynczireportError, h$catch_e];
  this.sp = 3;
  this.mask = 0;
  this.interruptible = false;
  this.excep = [];
  this.delayed = false;
  this.blockedOn = null;
  this.retryInterrupted = null;
  this.transaction = null;
  this.isSynchronous = false;
  this.continueAsync = false;
  this.m = 0;
}
function h$rts_getThreadId(t) {
  return t.tid;
}
function h$cmp_thread(t1,t2) {
  if(t1.tid < t2.tid) return -1;
  if(t1.tid > t2.tid) return 1;
  return 0;
}
function h$threadString(t) {
  if(t === null) {
    return "<no thread>";
  } else if(t.label) {
    var str = h$decodeUtf8z(t.label[0], t.label[1]);
    return str + " (" + t.tid + ")";
  } else {
    return (""+t.tid);
  }
}
function h$fork(a, inherit) {
  var t = new h$Thread();
  ;
  if(inherit && h$currentThread) {
    t.mask = h$currentThread.mask;
  }
  t.stack[4] = h$ap_1_0;
  t.stack[5] = a;
  t.stack[6] = h$return;
  t.sp = 6;
  h$wakeupThread(t);
  return t;
}
function h$threadStatus(t) {
  h$ret1 = 1;
  h$ret2 = 0;
  return t.status;
}
function h$waitRead(fd) {
  h$fds[fd].waitRead.push(h$currentThread);
  h$currentThread.interruptible = true;
  h$blockThread(h$currentThread,fd,[h$waitRead,fd]);
  return h$reschedule;
}
function h$waitWrite(fd) {
  h$fds[fd].waitWrite.push(h$currentThread);
  h$currentThread.interruptible = true;
  h$blockThread(h$currentThread,fd,[h$waitWrite,fd]);
  return h$reschedule;
}
var h$delayed = new goog.structs.Heap();
function h$wakeupDelayed(now) {
  while(h$delayed.getCount() > 0 && h$delayed.peekKey() < now) {
    var t = h$delayed.remove();
    if(t.delayed) {
      t.delayed = false;
      h$wakeupThread(t);
    }
  }
}
function h$delayThread(time) {
  var now = Date.now();
  var ms = time/1000;
  ;
  h$delayed.insert(now+ms, h$currentThread);
  h$sp += 2;
  h$stack[h$sp-1] = h$r1;
  h$stack[h$sp] = h$return;
  h$currentThread.delayed = true;
  h$blockThread(h$currentThread, h$delayed,[h$resumeDelayThread]);
  return h$reschedule;
}
function h$resumeDelayThread() {
  h$r1 = false;
  return h$stack[h$sp];
}
function h$yield() {
  h$sp += 2;
  h$stack[h$sp-1] = h$r1;
  h$stack[h$sp] = h$return;
  h$currentThread.sp = h$sp;
  return h$reschedule;
}
function h$killThread(t, ex) {
  ;
  if(t === h$currentThread) {
    h$sp += 2;
    h$stack[h$sp-1] = h$r1;
    h$stack[h$sp] = h$return;
    return h$throw(ex,true);
  } else {
    ;
    if(t.mask === 0 || (t.mask === 2 && t.interruptible)) {
      if(t.stack) {
        h$forceWakeupThread(t);
        t.sp += 2;
        t.stack[t.sp-1] = ex;
        t.stack[t.sp] = h$raiseAsync_frame;
      }
      return h$stack[h$sp];
    } else {
      t.excep.push([h$currentThread,ex]);
      h$blockThread(h$currentThread,t,null);
      h$currentThread.interruptible = true;
      h$sp += 2;
      h$stack[h$sp-1] = h$r1;
      h$stack[h$sp] = h$return;
      return h$reschedule;
    }
  }
}
function h$maskStatus() {
  ;
  return h$currentThread.mask;
}
function h$maskAsync(a) {
  ;
  if(h$currentThread.mask !== 2) {
    if(h$currentThread.mask === 0 && h$stack[h$sp] !== h$maskFrame && h$stack[h$sp] !== h$maskUnintFrame) {
      h$stack[++h$sp] = h$unmaskFrame;
    }
    if(h$currentThread.mask === 1) {
      h$stack[++h$sp] = h$maskUnintFrame;
    }
    h$currentThread.mask = 2;
  }
  h$r1 = a;
  return h$ap_1_0_fast();
}
function h$maskUnintAsync(a) {
  ;
  if(h$currentThread.mask !== 1) {
    if(h$currentThread.mask === 2) {
      h$stack[++h$sp] = h$maskFrame;
    } else {
      h$stack[++h$sp] = h$unmaskFrame;
    }
    h$currentThread.mask = 1;
  }
  h$r1 = a;
  return h$ap_1_0_fast();
}
function h$unmaskAsync(a) {
  ;
  if(h$currentThread.excep.length > 0) {
    h$currentThread.mask = 0;
    h$sp += 3;
    h$stack[h$sp-2] = h$ap_1_0;
    h$stack[h$sp-1] = a;
    h$stack[h$sp] = h$return;
    return h$reschedule;
  }
  if(h$currentThread.mask !== 0) {
    if(h$stack[h$sp] !== h$unmaskFrame) {
      if(h$currentThread.mask === 2) {
        h$stack[++h$sp] = h$maskFrame;
      } else {
        h$stack[++h$sp] = h$maskUnintFrame;
      }
    }
    h$currentThread.mask = 0;
  }
  h$r1 = a;
  return h$ap_1_0_fast();
}
function h$pendingAsync() {
  var t = h$currentThread;
  return (t.excep.length > 0 && (t.mask === 0 || (t.mask === 2 && t.interruptible)));
}
function h$postAsync(alreadySuspended,next) {
  var t = h$currentThread;
  if(h$pendingAsync()) {
    ;
    var v = t.excep.shift();
    var tposter = v[0];
    var ex = v[1];
    if(v !== null && tposter !== null) {
      h$wakeupThread(tposter);
    }
    if(!alreadySuspended) {
      h$suspendCurrentThread(next);
    }
    h$sp += 2;
    h$stack[h$sp-1] = ex;
    h$stack[h$sp] = h$raiseAsync_frame;
    t.sp = h$sp;
    return true;
  } else {
    return false;
  }
}
function h$wakeupThread(t) {
  ;
  if(t.status === h$threadBlocked) {
    t.blockedOn = null;
    t.status = h$threadRunning;
    h$blocked.remove(t);
  }
  t.interruptible = false;
  t.retryInterrupted = null;
  h$threads.enqueue(t);
}
function h$forceWakeupThread(t) {
  ;
  if(t.status === h$threadBlocked) {
    h$removeThreadBlock(t);
    h$wakeupThread(t);
  }
}
function h$removeThreadBlock(t) {
  if(t.status === h$threadBlocked) {
    var o = t.blockedOn;
    if(o === null || o === undefined) {
      throw ("h$removeThreadBlock: blocked on null or undefined: " + h$threadString(t));
    } else if(o === h$delayed) {
      t.delayed = false;
    } else if(o instanceof h$MVar) {
      ;
      ;
      o.readers.remove(t);
      var q = new goog.structs.Queue();
      var w;
      while ((w = o.writers.dequeue()) !== undefined) {
        if(w[0] !== t) { q.enqueue(w); }
      }
      o.writers = q;
      ;
    } else if(o instanceof h$Fd) {
      ;
      h$removeFromArray(o.waitRead,t);
      h$removeFromArray(o.waitWrite,t);
    } else if(o instanceof h$Thread) {
      ;
      for(var i=0;i<o.excep.length;i++) {
        if(o.excep[i][0] === t) {
          o.excep[i][0] = null;
          break;
        }
      }
    } else if (o instanceof h$TVarsWaiting) {
      h$stmRemoveBlockedThread(o.tvars, t)
    } else if(o.f && o.f.t === h$BLACKHOLE_CLOSURE) {
      ;
      h$removeFromArray(o.d2,t);
    } else {
      throw ("h$removeThreadBlock: blocked on unknown object: " + h$collectProps(o));
    }
    if(t.retryInterrupted) {
      t.sp+=2;
      t.stack[t.sp-1] = t.retryInterrupted;
      t.stack[t.sp] = h$retryInterrupted;
    }
  }
}
function h$removeFromArray(a,o) {
  var i;
  while((i = a.indexOf(o)) !== -1) {
    a.splice(i,1);
  }
}
function h$finishThread(t) {
  ;
  t.status = h$threadFinished;
  h$blocked.remove(t);
  t.stack = null;
  t.mask = 0;
  for(var i=0;i<t.excep.length;i++) {
    var v = t.excep[i];
    var tposter = v[0];
    if(v !== null && tposter !== null) {
      h$wakeupThread(tposter);
    }
  }
  t.excep = [];
}
function h$blockThread(t,o,resume) {
  ;
  if(o === undefined || o === null) {
    throw ("h$blockThread, no block object: " + h$threadString(t));
  }
  t.status = h$threadBlocked;
  t.blockedOn = o;
  t.retryInterrupted = resume;
  t.sp = h$sp;
  h$blocked.add(t);
}
var h$lastGc = Date.now();
var h$gcInterval = 1000;
function h$scheduler(next) {
  ;
  var now = Date.now();
  h$wakeupDelayed(now);
  if(h$currentThread && h$pendingAsync()) {
    ;
    if(h$currentThread.status !== h$threadRunning) {
      h$forceWakeupThread(h$currentThread);
      h$currentThread.status = h$threadRunning;
    }
    h$postAsync(next === h$reschedule, next);
    return h$stack[h$sp];
  }
  var t;
  while(t = h$threads.dequeue()) {
    if(t.status === h$threadRunning) { break; }
  }
  if(t === undefined) {
    ;
    if(h$currentThread && h$currentThread.status === h$threadRunning) {
      if(now - h$lastGc > h$gcInterval) {
        if(next !== h$reschedule && next !== null) {
          h$suspendCurrentThread(next);
          next = h$stack[h$sp];
        }
        var ct = h$currentThread;
        h$currentThread = null;
        h$gc(h$currentThread);
        h$currentThread = ct;
        h$stack = h$currentThread.stack;
        h$sp = h$currentThread.sp
      }
      ;
      return (next===h$reschedule || next === null)?h$stack[h$sp]:next;
    } else {
      ;
      h$currentThread = null;
      if(now - h$lastGc > h$gcInterval)
          h$gc(null);
      return null;
    }
  } else {
    ;
    if(h$currentThread !== null) {
      if(h$currentThread.status === h$threadRunning) {
        h$threads.enqueue(h$currentThread);
      }
      if(next !== h$reschedule && next !== null) {
        ;
        h$suspendCurrentThread(next);
      } else {
        ;
        h$currentThread.sp = h$sp;
      }
      h$postAsync(true, next);
    } else {
      ;
    }
    if(now - h$lastGc > h$gcInterval) {
      h$currentThread = null;
      h$gc(t);
    }
    h$currentThread = t;
    h$stack = t.stack;
    h$sp = t.sp;
    ;
    return h$stack[h$sp];
  }
}
var h$yieldRun;
if(false) {
  var handler = function(ev) {
    if(ev.data === "h$mainLoop") { h$mainLoop(); }
  };
  if(window.addEventListener) {
    window.addEventListener("message", handler);
  } else {
    window.attachEvent("message", handler);
  }
  h$yieldRun = function() { h$running = false; window.postMessage("h$mainLoop", "*"); }
} else if(typeof process !== 'undefined' && process.nextTick) {
  h$yieldRun = null;
} else if(typeof setTimeout !== 'undefined') {
  h$yieldRun = function() {
    ;
    h$running = false;
    setTimeout(h$mainLoop, 0);
  }
} else {
  h$yieldRun = null;
}
function h$startMainLoop() {
  if(h$yieldRun) {
    h$yieldRun();
  } else {
    h$mainLoop();
  }
}
var h$running = false;
var h$next = null;
function h$mainLoop() {
  if(h$running) return;
  h$running = true;
  h$run_init_static();
  h$currentThread = h$next;
  if(h$next !== null) {
    h$stack = h$currentThread.stack;
    h$sp = h$currentThread.sp;
  }
  var c = null;
  var count;
  var start = Date.now();
  do {
    c = h$scheduler(c);
    var scheduled = Date.now();
    if(c === null) {
      h$running = false;
      if(typeof setTimeout !== 'undefined') {
        h$next = null;
        setTimeout(h$mainLoop, 20);
        return;
      } else {
        while(c === null) { c = h$scheduler(c); }
      }
    }
    if(Date.now() - start > 100) {
      ;
      if(h$yieldRun) {
        if(c !== h$reschedule) {
          h$suspendCurrentThread(c);
        }
        h$next = h$currentThread;
        h$currentThread = null;
        return h$yieldRun();
      }
    }
    try {
      while(c !== h$reschedule && Date.now() - scheduled < 25) {
        count = 0;
        while(c !== h$reschedule && ++count < 1000) {
          c = c();
          c = c();
          c = c();
          c = c();
          c = c();
          c = c();
          c = c();
          c = c();
          c = c();
          c = c();
        }
      }
    } catch(e) {
      h$currentThread.status = h$threadDied;
      h$currentThread.stack = null;
      h$currentThread = null;
      h$stack = null;
      c = null;
      h$log("uncaught exception in Haskell thread: " + e.toString());
    }
  } while(true);
}
function h$run(a) {
  ;
  var t = h$fork(a, false);
  h$startMainLoop();
  return t;
}
function h$runSync(a, cont) {
  h$run_init_static();
  var c = h$return;
  var t = new h$Thread();
  t.isSynchronous = true;
  t.continueAsync = cont;
  var ct = h$currentThread;
  var csp = h$sp;
  var cr1 = h$r1;
  t.stack[4] = h$ap_1_0;
  t.stack[5] = a;
  t.stack[6] = h$return;
  t.sp = 6;
  t.status = h$threadRunning;
  var excep = null;
  var blockedOn = null;
  h$currentThread = t;
  h$stack = t.stack;
  h$sp = t.sp;
  try {
    while(true) {
      ;
      while(c !== h$reschedule) {
        c = c();
        c = c();
        c = c();
        c = c();
        c = c();
        c = c();
        c = c();
        c = c();
        c = c();
        c = c();
      }
      ;
      if(t.status === h$threadFinished) {
        ;
        break;
      } else {
        ;
      }
      var b = t.blockedOn;
      if(typeof b === 'object' && b && b.f && b.f.t === h$BLACKHOLE_CLOSURE) {
        var bhThread = b.d1;
        if(bhThread === ct || bhThread === t) {
          ;
          c = h$throw(h$baseZCControlziExceptionziBasezinonTermination, false);
        } else {
          if(h$runBlackholeThreadSync(b)) {
            ;
            c = h$stack[h$sp];
          } else {
            ;
            blockedOn = b;
            throw false;
          }
        }
      } else {
        ;
        blockedOn = b;
        throw false;
      }
    }
  } catch(e) { excep = e; }
  if(ct !== null) {
    h$currentThread = ct;
    h$stack = ct.stack;
    h$sp = csp;
    h$r1 = cr1;
  }
  if(t.status !== h$threadFinished && !cont) {
    h$removeThreadBlock(t);
    h$finishThread(t);
  }
  if(excep) {
    throw excep;
  }
  return blockedOn;
  ;
}
function h$runBlackholeThreadSync(bh) {
  ;
  var ct = h$currentThread;
  var sp = h$sp;
  var success = false;
  var bhs = [];
  var currentBh = bh;
  if(bh.d1.excep.length > 0) {
    return false;
  }
  h$currentThread = bh.d1;
  h$stack = h$currentThread.stack;
  h$sp = h$currentThread.sp;
  var c = (h$currentThread.status === h$threadRunning)?h$stack[h$sp]:h$reschedule;
  ;
  try {
    while(true) {
      while(c !== h$reschedule && currentBh.f.t === h$BLACKHOLE_CLOSURE) {
        c = c();
        c = c();
        c = c();
        c = c();
        c = c();
      }
      if(c === h$reschedule) {
        if(typeof h$currentThread.blockedOn === 'object' &&
           h$currentThread.blockedOn.f &&
           h$currentThread.blockedOn.f.t === h$BLACKHOLE_CLOSURE) {
          ;
          bhs.push(currentBh);
          currentBh = h$currentThread.blockedOn;
          h$currentThread = h$currentThread.blockedOn.d1;
          if(h$currentThread.excep.length > 0) {
            break;
          }
          h$stack = h$currentThread.stack;
          h$sp = h$currentThread.sp;
          c = (h$currentThread.status === h$threadRunning)?h$stack[h$sp]:h$reschedule;
        } else {
          ;
          break;
        }
      } else {
        ;
        ;
        h$suspendCurrentThread(c);
        if(bhs.length > 0) {
          ;
          currentBh = bhs.pop();
          h$currentThread = currentBh.d1;
          h$stack = h$currentThread.stack;
          h$sp = h$currentThread.sp;
        } else {
          ;
          success = true;
          break;
        }
      }
    }
  } catch(e) { }
  h$sp = sp;
  h$stack = ct.stack;
  h$currentThread = ct;
  return success;
}
function h$syncThreadState(tid) {
  return (tid.isSynchronous ? 1 : 0) |
         (tid.continueAsync ? 2 : 0);
}
function h$main(a) {
  var t = new h$Thread();
  t.stack[0] = h$doneMain;
  t.stack[4] = h$ap_1_0;
  t.stack[5] = h$flushStdout;
  t.stack[6] = h$return;
  t.stack[7] = h$ap_1_0;
  t.stack[8] = a;
  t.stack[9] = h$return;
  t.sp = 9;
  t.label = [h$encodeUtf8("main"), 0];
  h$wakeupThread(t);
  h$startMainLoop();
  return t;
}
var h$mvarId = 0;
function h$MVar() {
  ;
  this.val = null;
  this.readers = new goog.structs.Queue();
  this.writers = new goog.structs.Queue();
  this.waiters = null;
  this.m = 0;
  this.id = ++h$mvarId;
}
function h$notifyMVarEmpty(mv) {
  var w = mv.writers.dequeue();
  if(w !== undefined) {
    var thread = w[0];
    var val = w[1];
    ;
    mv.val = val;
    if(thread !== null) {
      h$wakeupThread(thread);
    }
  } else {
    ;
    mv.val = null;
  }
  ;
}
function h$notifyMVarFull(mv,val) {
  if(mv.waiters && mv.waiters.length > 0) {
    for(var i=0;i<mv.waiters.length;i++) {
      var w = mv.waiters[i];
      w.sp += 2;
      w.stack[w.sp-1] = val;
      w.stack[w.sp] = h$return;
      h$wakeupThread(w);
    }
    mv.waiters = null;
  }
  var r = mv.readers.dequeue();
  if(r !== undefined) {
    ;
    r.sp += 2;
    r.stack[r.sp-1] = val;
    r.stack[r.sp] = h$return;
    h$wakeupThread(r);
    mv.val = null;
  } else {
    ;
    mv.val = val;
  }
  ;
}
function h$takeMVar(mv) {
  ;
  if(mv.val !== null) {
    h$r1 = mv.val;
    h$notifyMVarEmpty(mv);
    return h$stack[h$sp];
  } else {
    mv.readers.enqueue(h$currentThread);
    h$currentThread.interruptible = true;
    h$blockThread(h$currentThread,mv,[h$takeMVar,mv]);
    return h$reschedule;
  }
}
function h$tryTakeMVar(mv) {
  ;
  if(mv.val === null) {
    h$ret1 = null;
    return 0;
  } else {
    h$ret1 = mv.val;
    h$notifyMVarEmpty(mv);
    return 1;
  }
}
function h$readMVar(mv) {
  ;
  if(mv.val === null) {
    if(mv.waiters) {
      mv.waiters.push(h$currentThread);
    } else {
      mv.waiters = [h$currentThread];
    }
    h$currentThread.interruptible = true;
    h$blockThread(h$currentThread,mv,[h$readMVar,mv]);
    return h$reschedule;
  } else {
    h$r1 = mv.val;
    return h$stack[h$sp];
  }
}
function h$putMVar(mv,val) {
  ;
  if(mv.val !== null) {
    mv.writers.enqueue([h$currentThread,val]);
    h$currentThread.interruptible = true;
    h$blockThread(h$currentThread,mv,[h$putMVar,mv,val]);
    return h$reschedule;
  } else {
    h$notifyMVarFull(mv,val);
    return h$stack[h$sp];
  }
}
function h$tryPutMVar(mv,val) {
  ;
  if(mv.val !== null) {
    return 0;
  } else {
    h$notifyMVarFull(mv,val);
    return 1;
  }
}
function h$writeMVarJs1(mv,val) {
  var v = h$c1(h$data1_e, val);
  if(mv.val !== null) {
    ;
    mv.writers.enqueue([null,v]);
  } else {
    ;
    h$notifyMVarFull(mv,v);
  }
}
function h$writeMVarJs2(mv,val1,val2) {
  var v = h$c2(h$data1_e, val1, val2);
  if(mv.val !== null) {
    ;
    mv.writers.enqueue([null,v]);
  } else {
    ;
    h$notifyMVarFull(mv,v);
  }
}
function h$MutVar(v) {
  this.val = v;
  this.m = 0;
}
function h$atomicModifyMutVar(mv, fun) {
  var thunk = h$c2(h$ap1_e, fun, mv.val);
  mv.val = h$c1(h$select1_e, thunk);
  return h$c1(h$select2_e, thunk);
}
function h$blockOnBlackhole(c) {
  ;
  if(c.d1 === h$currentThread) {
    ;
    return h$throw(h$baseZCControlziExceptionziBasezinonTermination, false);
  }
  ;
  if(c.d2 === null) {
    c.d2 = [h$currentThread];
  } else {
    c.d2.push(h$currentThread);
  }
  h$blockThread(h$currentThread,c,[h$resumeBlockOnBlackhole,c]);
  return h$reschedule;
}
function h$resumeBlockOnBlackhole(c) {
  h$r1 = c;
  return h$ap_0_0_fast();
}
function h$makeResumable(bh,start,end,extra) {
  var s = h$stack.slice(start,end+1);
  if(extra) {
    s = s.concat(extra);
  }
  bh.f = h$resume_e;
  bh.d1 = s;
  bh.d2 = null;
}
var h$enabled_capabilities = h$newByteArray(4);
h$enabled_capabilities.i3[0] = 1;
function h$rtsSupportsBoundThreads() {
  return 0;
}
function h$mkForeignCallback(x) {
  return function() {
    if(x.mv === null) {
      x.mv = arguments;
    } else {
      h$notifyMVarFull(x.mv, h$c1(h$data1_e, arguments));
    }
  }
}
function h$makeMVarListener(mv, stopProp, stopImmProp, preventDefault) {
  var f = function(event) {
    ;
    h$writeMVarJs1(mv,event);
    if(stopProp) { event.stopPropagation(); }
    if(stopImmProp) { event.stopImmediatePropagation(); }
    if(preventDefault) { event.preventDefault(); }
  }
  f.root = mv;
  return f;
}

var h$stmTransactionActive = 0;
var h$stmTransactionWaiting = 4;
function h$Transaction(o, parent) {
  ;
  this.action = o;
  this.tvars = new goog.structs.Map();
  this.accessed = parent===null?new goog.structs.Map():parent.accessed;
  this.checkRead = parent===null?null:parent.checkRead;
  this.parent = parent;
  this.state = h$stmTransactionActive;
  this.invariants = [];
  this.m = 0;
}
function h$StmInvariant(a) {
  this.action = a;
}
function h$WrittenTVar(tv,v) {
  this.tvar = tv;
  this.val = v;
}
function h$TVar(v) {
  ;
  this.val = v;
  this.blocked = new goog.structs.Set();
  this.invariants = null;
  this.m = 0;
}
function h$TVarsWaiting(s) {
  this.tvars = s;
}
function h$LocalInvariant(o) {
  this.action = o;
  this.dependencies = new goog.structs.Set();
}
function h$LocalTVar(v) {
  ;
  this.readVal = v.val;
  this.val = v.val;
  this.tvar = v;
}
function h$atomically(o) {
  h$p3(o, h$atomically_e, h$checkInvariants_e);
  return h$stmStartTransaction(o);
}
function h$stmStartTransaction(o) {
  ;
  var t = new h$Transaction(o, null);
  h$currentThread.transaction = t;
  h$r1 = o;
  return h$ap_1_0_fast();
}
function h$stmUpdateInvariantDependencies(inv) {
  var i = h$currentThread.transaction.checkRead.__iterator__();
  if(inv instanceof h$LocalInvariant) {
    try {
      while(true) {
        inv.dependencies.add(i.next());
      }
    } catch(e) { if(e !== goog.iter.StopIteration) { throw e; } }
  } else {
    try {
      while(true) {
        h$stmAddTVarInvariant(i.next(), inv);
      }
    } catch(e) { if(e !== goog.iter.StopIteration) { throw e; } }
  }
}
function h$stmAddTVarInvariant(tv, inv) {
  if(tv.invariants === null) {
    tv.invariants = new goog.structs.Set();
  }
  tv.invariants.add(inv);
}
function h$stmCommitTransaction() {
  var t = h$currentThread.transaction;
  var tvs = t.tvars;
  var i = tvs.getValueIterator();
  if(t.parent === null) {
    try {
      while(true) {
        var wtv = i.next();
        h$stmCommitTVar(wtv.tvar, wtv.val);
      }
    } catch(e) { if(e !== goog.iter.StopIteration) { throw e; } }
    for(var j=0;j<t.invariants.length;j++) {
      h$stmCommitInvariant(t.invariants[j]);
    }
  } else {
    var tpvs = t.parent.tvars;
    try {
      while(true) {
        var wtv = i.next();
        tpvs.set(goog.getUid(wtv.tvar), wtv);
      }
    } catch(e) { if(e !== goog.iter.StopIteration) { throw e; } }
    t.parent.invariants = t.parent.invariants.concat(t.invariants);
  }
  h$currentThread.transaction = t.parent;
}
function h$stmValidateTransaction() {
  var i = h$currentThread.transaction.accessed.getValueIterator();
  try {
    while(true) {
      var ltv = i.next();
      ;
      if(ltv.readVal !== ltv.tvar.val) return false;
    }
  } catch(e) { if(e !== goog.iter.StopIteration) { throw e; } }
  return true;
}
function h$stmAbortTransaction() {
  h$currentThread.transaction = h$currentThread.transaction.parent;
}
function h$stmCheck(o) {
  h$currentThread.transaction.invariants.push(new h$LocalInvariant(o));
  return false;
}
function h$stmRetry() {
  while(h$sp > 0) {
    var f = h$stack[h$sp];
    if(f === h$atomically_e || f === h$stmCatchRetry_e) {
      break;
    }
    var size;
    if(f === h$ap_gen) {
      size = ((h$stack[h$sp-1] >> 8) + 2);
    } else {
      var tag = f.gtag;
      if(tag < 0) {
        size = h$stack[h$sp-1];
      } else {
        size = (tag & 0xff) + 1;
      }
    }
    h$sp -= size;
  }
  if(h$sp > 0) {
    if(f === h$atomically_e) {
      return h$stmSuspendRetry();
    } else {
      var b = h$stack[h$sp-1];
      h$stmAbortTransaction();
      h$sp -= 2;
      h$r1 = b;
      return h$ap_1_0_fast();
    }
  } else {
    throw "h$stmRetry: STM retry outside a transaction";
  }
}
function h$stmSuspendRetry() {
  var i = h$currentThread.transaction.accessed.__iterator__();
  var tvs = new goog.structs.Set();
  try {
    while(true) {
      var tv = i.next().tvar;
      ;
      tv.blocked.add(h$currentThread);
      tvs.add(tv);
    }
  } catch(e) { if(e !== goog.iter.StopIteration) { throw e; } }
  waiting = new h$TVarsWaiting(tvs);
  h$blockThread(h$currentThread, waiting);
  h$p2(waiting, h$stmResumeRetry_e);
  return h$reschedule;
}
function h$stmCatchRetry(a,b) {
  h$currentThread.transaction = new h$Transaction(b, h$currentThread.transaction);
  h$p2(b, h$stmCatchRetry_e);
  h$r1 = a;
  return h$ap_1_0_fast();
}
function h$catchStm(a,handler) {
  h$p4(h$currentThread.transaction, h$currentThread.mask, handler, h$catchStm_e);
  h$r1 = a;
  return h$ap_1_0_fast();
}
var h$catchSTM = h$catchStm;
function h$newTVar(v) {
  return new h$TVar(v);
}
function h$readTVar(tv) {
  return h$readLocalTVar(h$currentThread.transaction,tv);
}
function h$readTVarIO(tv) {
  return tv.val;
}
function h$writeTVar(tv, v) {
  h$setLocalTVar(h$currentThread.transaction, tv, v);
}
function h$sameTVar(tv1, tv2) {
  return tv1 === tv2;
}
function h$readLocalTVar(t, tv) {
  if(t.checkRead !== null) {
    t.checkRead.add(tv);
  }
  var t0 = t;
  var tvi = goog.getUid(tv);
  while(t0 !== null) {
    var v = t0.tvars.get(tvi);
    if(v !== undefined) {
      ;
      return v.val;
    }
    t0 = t0.parent;
  }
  var lv = t.accessed.get(tvi);
  if(lv !== undefined) {
    ;
    return lv.val;
  } else {
    ;
    t.accessed.set(tvi, new h$LocalTVar(tv));
    return tv.val;
  }
}
function h$setLocalTVar(t, tv, v) {
  var tvi = goog.getUid(tv);
  if(!t.accessed.containsKey(tvi)) {
    t.accessed.set(tvi, new h$LocalTVar(tv));
  }
  if(t.tvars.containsKey(tvi)) {
    t.tvars.get(tvi).val = v;
  } else {
    t.tvars.set(tvi, new h$WrittenTVar(tv, v))
  }
}
function h$stmCheckInvariants() {
  var t = h$currentThread.transaction;
  function addCheck(inv) {
    h$p5(inv, h$stmCheckInvariantResult_e, t, inv, h$stmCheckInvariantStart_e);
  }
  h$p2(h$r1, h$return);
  var i = t.tvars.getValueIterator();
  try {
    while(true) {
      var wtv = i.next();
      ;
      var ii = wtv.tvar.invariants;
      if(ii) {
        var iii = ii.__iterator__();
        try {
          while(true) {
            addCheck(iii.next());
          }
        } catch(e) { if (e !== goog.iter.StopIteration) { throw e; } }
      }
    }
  } catch(e) { if(e !== goog.iter.StopIteration) { throw e; } }
  for(j=0;j<t.invariants.length;j++) {
    addCheck(t.invariants[j]);
  }
  return h$stack[h$sp];
}
function h$stmCommitTVar(tv, v) {
  if(v !== tv.val) {
    var iter = tv.blocked.__iterator__();
    try {
      while(true) {
        var thr = iter.next();
        if(thr.status === h$threadBlocked) {
          ;
          h$wakeupThread(thr);
        }
      }
    } catch(e) { if(e !== goog.iter.StopIteration) { throw e; } }
    tv.val = v;
  }
}
function h$stmRemoveBlockedThread(s, thread) {
  var i = s.tvars.__iterator__();
  try {
    while(true) {
      i.next().blocked.remove(thread);
    }
  } catch (e) { if(e !== goog.iter.StopIteration) { throw e; } }
}
function h$stmCommitInvariant(localInv) {
  var inv = new h$StmInvariant(localInv.action);
  var i = localInv.dependencies.__iterator__();
  try {
    while(true) {
      h$stmAddTVarInvariant(i.next(), inv);
    }
  } catch (e) { if(e !== goog.iter.StopIteration) { throw e; } }
}

function h$isFloat (n) {
  return n===+n && n!==(n|0);
}
function h$isInteger (n) {
  return n===+n && n===(n|0);
}
function h$typeOf(o) {
    if (!(o instanceof Object)) {
        if (o == null) {
            return 0;
        } else if (typeof o == 'number') {
            if (h$isInteger(o)) {
                return 1;
            } else {
                return 2;
            }
        } else if (typeof o == 'boolean') {
            return 3;
        } else {
            return 4;
        }
    } else {
        if (Object.prototype.toString.call(o) == '[object Array]') {
            return 5;
        } else if (!o) {
            return 0;
        } else {
            return 6;
        }
    }
}
function h$listprops(o) {
    if (!(o instanceof Object)) {
        return [];
    }
    var l = [];
    for (var prop in o) {
        l.push(prop);
    }
    return l;
}
function h$flattenObj(o) {
    var l = [];
    for (var prop in o) {
        l.push([prop, o[prop]]);
    }
    return l;
}

function h$hashable_fnv_hash_offset(str_a, o, len, hash) {
  return h$hashable_fnv_hash(str_a, o, len, hash);
}
function h$hashable_fnv_hash(str_d, str_o, len, hash) {
  if(len > 0) {
    var d = str_d.u8;
    for(var i=0;i<len;i++) {
      hash = h$mulInt32(hash, 16777619) ^ d[str_o+i];
    }
  }
  return hash;
}
function h$hashable_getRandomBytes(dest_d, dest_o, len) {
  if(len > 0) {
    var d = dest_d.u8;
    for(var i=0;i<len;i++) {
      d[dest_o+i] = Math.floor(Math.random() * 256);
    }
  }
  return len;
}

function h$_hs_text_memcpy(dst_v,dst_o2,src_v,src_o2,n) {
  return h$memcpy(dst_v,2*dst_o2,src_v,2*src_o2,2*n);
}
function h$_hs_text_memcmp(a_v,a_o2,b_v,b_o2,n) {
  return h$memcmp(a_v,2*a_o2,b_v,2*b_o2,2*n);
}
var h$_text_UTF8_ACCEPT = 0;
var h$_text_UTF8_REJECT = 12
var h$_text_utf8d =
   [
   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
   1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1, 9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,
   7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7, 7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,7,
   8,8,2,2,2,2,2,2,2,2,2,2,2,2,2,2, 2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,
  10,3,3,3,3,3,3,3,3,3,3,3,3,4,3,3, 11,6,6,6,5,8,8,8,8,8,8,8,8,8,8,8,
   0,12,24,36,60,96,84,12,12,12,48,72, 12,12,12,12,12,12,12,12,12,12,12,12,
  12, 0,12,12,12,12,12, 0,12, 0,12,12, 12,24,12,12,12,12,12,24,12,24,12,12,
  12,12,12,12,12,12,12,24,12,12,12,12, 12,24,12,12,12,12,12,12,12,24,12,12,
  12,12,12,12,12,12,12,36,12,36,12,12, 12,36,12,12,12,12,12,36,12,36,12,12,
  12,36,12,12,12,12,12,12,12,12,12,12];
function h$_hs_text_decode_utf8_internal ( dest_v
                                         , destoff_v, destoff_o
                                         , src_v, src_o
                                         , src_end_v, src_end_o
                                         , s
                                         ) {
  if(src_v === null || src_end_v === null) {
    h$ret1 = src_end_o;
    return null;
  }
  var dsto = destoff_v.dv.getUint32(destoff_o,true) << 1;
  var srco = src_o;
  var state = s.state;
  var codepoint = s.codepoint;
  var ddv = dest_v.dv;
  var sdv = src_v.dv;
  function decode(b) {
    var type = h$_text_utf8d[b];
    codepoint = (state !== h$_text_UTF8_ACCEPT) ?
      (b & 0x3f) | (codepoint << 6) :
      (0xff >>> type) & b;
    state = h$_text_utf8d[256 + state + type];
    return state;
  }
  while (srco < src_end_o) {
    if(decode(sdv.getUint8(srco++)) !== h$_text_UTF8_ACCEPT) {
      if(state !== h$_text_UTF8_REJECT) {
        continue;
      } else {
        break;
      }
    }
    if (codepoint <= 0xffff) {
      ddv.setUint16(dsto,codepoint,true);
      dsto += 2;
    } else {
      ddv.setUint16(dsto,(0xD7C0 + (codepoint >>> 10)),true);
      ddv.setUint16(dsto+2,(0xDC00 + (codepoint & 0x3FF)),true);
      dsto += 4;
    }
    s.last = srco;
  }
  s.state = state;
  s.codepoint = codepoint;
  destoff_v.dv.setUint32(destoff_o,dsto>>1,true);
  h$ret1 = srco;
  return src_v;
}
function h$_hs_text_decode_utf8_state( dest_v
                                     , destoff_v, destoff_o
                                     , src_v, src_o
                                     , srcend_v, srcend_o
                                     , codepoint0_v, codepoint0_o
                                     , state0_v, state0_o
                                     ) {
  var s = { state: state0_v.dv.getUint32(state0_o, true)
          , codepoint: codepoint0_v.dv.getUint32(codepoint0_o, true)
          , last: src_o
          };
  var ret = h$_hs_text_decode_utf8_internal ( dest_v
                                            , destoff_v, destoff_o
                                            , src_v.arr[src_o][0], src_v.arr[src_o][1]
                                            , srcend_v, srcend_o
                                            , s
                                            );
  src_v.arr[src_o][1] = s.last;
  state0_v.dv.setUint32(state0_o, s.state, true);
  codepoint0_v.dv.setUint32(codepoint0_o, s.codepoint, true);
  if(s.state === h$_text_UTF8_REJECT)
    h$ret1--;
  return ret;
}
function h$_hs_text_decode_utf8( dest_v
                               , destoff_v, destoff_o
                               , src_v, src_o
                               , srcend_v, srcend_o
                               ) {
  var s = { state: h$_text_UTF8_ACCEPT
          , codepoint: 0
          , last: src_o
          };
  var ret = h$_hs_text_decode_utf8_internal ( dest_v
                                            , destoff_v, destoff_o
                                            , src_v, src_o
                                            , srcend_v, srcend_o
                                            , s
                                            );
  if (s.state !== h$_text_UTF8_ACCEPT)
    h$ret1--;
  return ret;
}
function h$_hs_text_decode_latin1(dest_d, src_d, src_o, srcend_d, srcend_o) {
  var p = src_o;
  var d = 0;
  var su8 = src_d.u8;
  var su3 = src_d.u3;
  var du1 = dest_d.u1;
  while(p != srcend_o && p & 3) {
    du1[d++] = su8[p++];
  }
  if(su3) {
    while (p < srcend_o - 3) {
      var w = su3[p>>2];
      du1[d++] = w & 0xff;
      du1[d++] = (w >>> 8) & 0xff;
      du1[d++] = (w >>> 16) & 0xff;
      du1[d++] = (w >>> 32) & 0xff;
      p += 4;
    }
  }
  while (p != srcend_o)
    du1[d++] = su8[p++];
}
function h$_hs_text_encode_utf8(destp_v, destp_o, src_v, srcoff, srclen) {
  var dest_v = destp_v.arr[destp_o][0];
  var dest_o = destp_v.arr[destp_o][1];
  var src = srcoff;
  var dest = dest_o;
  var srcend = src + srclen;
  var srcu1 = src_v.u1;
  if(!srcu1) throw "h$_hs_text_encode_utf8: invalid alignment for source";
  var srcu3 = src_v.u3;
  var destu8 = dest_v.u8;
  while(src < srcend) {
    while(srcu3 && !(src & 1) && srcend - src >= 2) {
      var w = srcu3[src>>1];
      if(w & 0xFF80FF80) break;
      destu8[dest++] = w & 0xFFFF;
      destu8[dest++] = w >>> 16;
      src += 2;
    }
    while(src < srcend) {
      var w = srcu1[src++];
      if(w <= 0x7F) {
        destu8[dest++] = w;
        break;
      } else if(w <= 0x7FF) {
        destu8[dest++] = (w >> 6) | 0xC0;
        destu8[dest++] = (w & 0x3f) | 0x80;
      } else if(w < 0xD800 || w > 0xDBFF) {
        destu8[dest++] = (w >>> 12) | 0xE0;
        destu8[dest++] = ((w >> 6) & 0x3F) | 0x80;
        destu8[dest++] = (w & 0x3F) | 0x80;
      } else {
        var c = ((w - 0xD800) << 10) + (srcu1[src++] - 0xDC00) + 0x10000;
        destu8[dest++] = (c >>> 18) | 0xF0;
        destu8[dest++] = ((c >> 12) & 0x3F) | 0x80;
        destu8[dest++] = ((c >> 6) & 0x3F) | 0x80;
        destu8[dest++] = (c & 0x3F) | 0x80;
      }
    }
  }
  destp_v.arr[destp_o][1] = dest;
}

