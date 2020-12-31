(function (exports) {
  "use strict";
/*
 * Constructor. Takes no arguments.
*/

  function DoublyLinkedList(max = 1000) {
    // pointer to first item
    this._head = null;
    // pointer to the last item
    this._tail = null;
    // length of list
    this._length = 0;
    // maximum cache entries
    this._maxlength = max;
  }

  // Wraps data in a node object.
  DoublyLinkedList.prototype._createNewNode = function (data) {
    var list = this;

    var node = {
      data: data,
      next: null,
      prev: null,

      remove: function() {
        if (this.prev !== null) {
          this.prev.next = this.next;
        }

        if (this.next !== null) {
          this.next.prev = this.prev;
        }

        if (list._head === this) {
          list._head = this.next;
        }

        if (list._tail === this) {
          list._tail = this.prev;
        }

        list._length--;
      },

      prepend: function(data) {
        if (list._head === this) {
          return list.prepend(data);
        }

        var newNode = list._createNewNode(data);
        newNode.prev = this.prev;
        newNode.next = this;
        this.prev.next = newNode;
        this.prev = newNode;

        list._length++;
        return newNode;
      },

      append: function(data) {
        if (list._tail === this) {
          return list.append(data);
        }

        var newNode = list._createNewNode(data);
        newNode.prev = this;
        newNode.next = this.next;
        this.next.prev = newNode;
        this.next = newNode;

        list._length++;
        return newNode;
      },

      getkey: function() {
        return this.data.key;
      }
    };

    return node;
  };

/*
 * Appends a node to the end of the list.
*/
  DoublyLinkedList.prototype.append = function (data) {
    var node = this._createNewNode(data);

    if (this._length === 0) {

      // first node, so all pointers to this
      this._head = node;
      this._tail = node;
    } else {

      // put on the tail
      this._tail.next = node;
      node.prev = this._tail;
      this._tail = node;
    }

    // update count
    this._length++;

    return node;
  };

/*
 * Prepends a node to the end of the list.
*/
  DoublyLinkedList.prototype.prepend = function (data) {
    var node = this._createNewNode(data);

    if (this._head === null) {

      // we are empty, so this is the first node
      // use the same logic as append
      return this.append(data);
    } else {

      // place before head
      this._head.prev = node;
      node.next = this._head;
      this._head = node;
    }

    // update count
    this._length++;

    return node;
  };

/*
 * Returns the node at the specified index. The index starts at 0.
*/
  DoublyLinkedList.prototype.item = function (index) {
    if (index >= 0 && index < this._length) {
      var node = this._head;
      while (index--) {
        node = node.next;
      }
      return node;
    }
  };

/*
 * Returns the node at the head of the list.
*/
  DoublyLinkedList.prototype.head = function () {
    return this._head;
  };

/*
 * Returns the node at the tail of the list.
*/
  DoublyLinkedList.prototype.tail = function () {
    return this._tail;
  };

/*
 * Returns the size of the list.
*/
  DoublyLinkedList.prototype.size = function () {
    return this._length;
  };

/*
 * Removes the item at the index.
*/
  DoublyLinkedList.prototype.remove = function (index) {
    throw "Not implemented";
  };

/*
 * For cache: gets node with a specified data.key
*/
  DoublyLinkedList.prototype.getnode = function (key) {
    var len = this._length;
    var node = this._head;
    while (node && len-- > 0) {
      if (node.getkey() === key) {
        return node;
      }
      node = node.next;
    };

    return null;
  };

/*
 * For cache: adds entry or update existing if the key exists
*/
  DoublyLinkedList.prototype.put = function (key, entry) {
    var n = this.getnode(key);
    if (!n) {
      if (this._length + 1 > this._maxlength) {
        // Evoke last element
        this.tail().remove();
      }
      this.prepend({key: key, entry: entry});
    }
    else {
      n.data.entry = entry;
    }
  };

/*
 * For cache: get entry for a specified key and move it in list
 * Returns null if there is no entry with such key
*/
  DoublyLinkedList.prototype.get = function (key) {
    var n = this.getnode(key);
    if (!n) {
      return null;
    }
    else {
      this.updatepriority(n);
      return n.data.entry;
    }
  };

/*
 * For cache: move element "up" in list
*/
  DoublyLinkedList.prototype.updatepriority = function (n) {
    if (n.prev) {
      let tmp = n.prev;
      n.prev = tmp.prev;
      tmp.next = n.next;
      n.next = tmp;
      tmp.prev = n;
      if (n.prev) {
        n.prev.next = n;
      }
      else {
        this._head = n;
      }
      if (tmp.next) {
        tmp.next.prev = tmp;
      }
      else {
        this._tail = tmp;
      }
    }
  };

/*
 * For cache: converts cache to an array, sorted by cache "priorities"
*/
  DoublyLinkedList.prototype.toarray = function () {
    var n = this._head;
    var arr = new Array();
    while (n != null) {
      arr.push(n.data);
      n = n.next;
    }

    return arr;
  }

/*
 * For cache: fills cache from array
 * Returns new length
*/
  DoublyLinkedList.prototype.fromarray = function (arr) {
    this._head = null;
    this._tail = null;
    this._length = 0;

    arr.forEach((item) => {
      this.append(item);
    });

    return this._length;
  }

  exports.DoublyLinkedList = DoublyLinkedList;
})(typeof exports === 'undefined' ? this['DLL'] = {} : exports);
