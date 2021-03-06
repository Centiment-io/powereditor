/**
* Copyright (c) 2011, Facebook, Inc.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
*   * Redistributions of source code must retain the above copyright notice,
*     this list of conditions and the following disclaimer.
*   * Redistributions in binary form must reproduce the above copyright notice,
*     this list of conditions and the following disclaimer in the documentation
*     and/or other materials provided with the distribution.
*   * Neither the name Facebook nor the names of its contributors may be used to
*     endorse or promote products derived from this software without specific
*     prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*
*
*/

var fun = require("../../../uki-core/function");
var utils = require("../../../uki-core/utils");

var Observable = require("../../../uki-core/observable").Observable;


var Selection = fun.newClass(Observable, {

  /**
  * @constructor
  */
  init: function(indexes) {
    this._indexes = indexes || [];
  },

  indexes: fun.newProp('indexes', function(indexes) {
    this.clear();
    this._indexes = indexes || [];
    if (this._indexes.length) {
      this._triggerUpdate(false, indexes[0], indexes[indexes.length - 1]);
    }
  }),

  index: function(value) {
    if (value === undefined) {
      return this.indexes().length ? this.indexes()[0] : -1;
    }
    return this.indexes(value < 0 ? [] : [value]);
  },

  empty: function() {
    return this.indexes().length === 0;
  },

  addRange: function(from, to) {
    spliceRange(this.indexes(), from, to, utils.range(from, to));
    this._triggerUpdate(false, from, to);
    return this;
  },

  removeRange: function(from, to) {
    spliceRange(this.indexes(), from, to, []);
    this._triggerUpdate(true, from, to);
    return this;
  },

  selectedInRange: function(from, to) {
    var fromPos = utils.binarySearch(this.indexes(), from);
    var toPos   = utils.binarySearch(this.indexes(), to, fromPos);

    return this.indexes().slice(fromPos, toPos);
  },

  isSelected: function(index) {
    var pos = utils.binarySearch(this.indexes(), index);
    return this.indexes()[pos] === index;
  },

  toggle: function(index) {
    if (this.isSelected(index)) {
      this.removeRange(index, index);
    } else {
      this.addRange(index, index);
    }
    return this;
  },

  clear: function() {
    var indexes = this.indexes();
    if (indexes.length > 0) {
      this._triggerUpdate(true, indexes[0], indexes[indexes.length - 1]);
    }
    this._indexes = [];
    return this;
  },

  _triggerUpdate: function(isRemove, from, to) {
    this.trigger({
      type: 'update',
      action: isRemove ? 'remove' : 'add',
      from: from,
      to: to
    });
  }
});

function spliceRange(indexes, from, to, range) {
  var fromPos = utils.binarySearch(indexes, from);
  var toPos   = utils.binarySearch(indexes, to, fromPos);

  // binarySearch returns insert position, so if we have to in indexes move
  // to the next position so we replace it also
  if (indexes[toPos] === to) { toPos++; }

  if (range) {
    indexes.splice.apply(indexes, [fromPos, toPos - fromPos].concat(range));
  } else {
    if (toPos > fromPos) {
      indexes.splice(fromPos, toPos - fromPos);
    }
  }
}


exports.Selection = Selection;
