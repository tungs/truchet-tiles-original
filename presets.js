/**
 * Truchet Tiles
 * Copyright (C) 2017  Steve Tung
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, as version 3 of the License.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

var stateFromPattern = function (pattern) {
  return function (i, j) {
    var row = pattern[j % pattern.length];
    return row[i % row.length];
  };
};
var getQuadrant = function (i, j, numCols, numRows) {
  return (i < numCols / 2 ? 0 : 1) + (j < numRows/2 ? 0 : 2);
};
var stateFromQuadrant = function (offsets) {
  return function (i, j, numCols, numRows) {
    var q = getQuadrant(i, j, numCols, numRows);
    return (((i+j) % 2) * 2 + offsets[q])%4;
  };
};

// eslint-disable-next-line no-unused-vars
var presets = [
  {
    displayName: 'Truchet A',
    state: function () {
      return 0;
    }
  },
  {
    displayName: 'Truchet B',
    state: function (i, j) {
      return j%2 ? 2 : 0;
    }
  },
  {
    displayName: 'Truchet C',
    state: function (i, j) {
      return (i+j)%2 ? 2 : 0;
    }
  },
  {
    displayName: 'Truchet D',
    state: function (i, j) {
      return (j%2) ? ((i%2)+2) : (1 - (i%2));
    }
  },
  {
    displayName: 'Truchet E',
    state: function (i, j) {
      return i%2 ? (4-(i+j)%4) : (i+j)%4;
    }
  },
  {
    displayName: 'Truchet F',
    state: function (i, j) {
      return j%2 ? (i%2)*3 : i%2+1;
    }
  },
  {
    displayName: 'Truchet G',
    state: function (i, j) {
      return ((i + j + (j % 4 < 2 ? 0 : 1))%2)*2;
    }
  },
  {
    displayName: 'Truchet H',
    state: function (i, j) {
      return (i%3 === j%3) ? 1 : 3;
    }
  },
  {
    displayName: 'Truchet I',
    state: function (i, j) {
      return (((i+1)%4 < 2 ? 2 : 0)+((j+1)%4<2 ? 0 : 2))%4;
    }
  },
  {
    displayName: 'Truchet L',
    state: function (i, j) {
      var line = j%4;
      if (line === 0) {
        return ((i + 1) % 2) * 3;
      } else if (line === 1) {
        return (i + 2) % 4;
      } else if (line === 2) {
        return (4 - (i + 1) % 4) % 4;
      } else if (line === 3) {
        return (i+1)%2 + 1;
      }
    }
  },
  {
    displayName: 'Truchet M',
    state: function (i, j) {
      return (i + j) % 2 + 1;
    }
  },
  {
    displayName: 'Truchet N',
    state: function (i, j) {
      return j % 2 ? (i + j + 1) % 4 : (4 - (i + j + 3) % 4) % 4;
    }
  },
  {
    displayName: 'Truchet O',
    state: function (i, j) {
      return (i + 3 + (j%2 ? 0 : 2)) % 4;
    }
  },
  {
    displayName: 'Truchet P',
    state: function (i, j) {
      return j % 2 ? ((i + 1) % 2)*3 : (i % 2) + 1;
    }
  },
  {
    displayName: 'Truchet Q',
    state: function (i, j) {
      return j % 2 ? ((i % 4) < 2 ? 1 : 2) : (i % 4 < 2 ? 3 : 0);
    }
  },
  {
    displayName: 'Truchet R',
    state: function (i) {
      return (i % 2) ? 0 : 3;
    }
  },
  {
    displayName: 'Truchet S',
    state: function (i) {
      return (3 + i)%4;
    }
  },
  {
    displayName: 'Truchet T',
    state: stateFromPattern([[1,3,0,2]])
  },
  {
    displayName: 'Truchet U',
    state: function (i, j) {
      return [1,3,0,2][(i+j)%4];
    }
  },
  {
    displayName: 'Truchet V',
    state: function (i, j) {
      return [2,0,3,0,2,0,1,0][(i+j)%8];
    }
  },
  {
    displayName: 'Truchet X',
    state: function (i, j) {
      return ([2,0,3,0,0,2][(i+j)%6]+(j%2 ? 2 : 0)) % 4;
    }
  },
  {
    displayName: 'Truchet Y',
    state: stateFromPattern([
      [1,3,0,2],
      [3,1,2,0],
      [2,0,3,1],
      [0,2,1,3]
    ])
  },
  {
    displayName: 'Truchet Z',
    state: function (i, j) {
      return [1,2,0,3][(4+i-(j%2))%4];
    }
  },
  {
    displayName: 'Truchet &',
    state: stateFromPattern([
      [1,3,2,0],
      [3,1,0,2],
      [0,2,3,1],
      [2,0,1,3]
    ])
  },
  {
    displayName: 'Truchet 1',
    state: stateFromPattern([
      [0,2,0,2,1,3,1,3],
      [1,3,1,3,0,2,0,2],
      [3,1,3,1,2,0,2,0],
      [1,3,1,3,0,2,0,2],
      [3,1,3,1,2,0,2,0],
      [2,0,2,0,3,1,3,1],
      [0,2,0,2,1,3,1,3],
      [2,0,2,0,3,1,3,1]
    ])
  },
  {
    displayName: 'Truchet 2',
    state: stateFromPattern([
      [3,0,2,1,3,0],
      [0,2,0,3,1,3],
      [2,0,1,2,3,1],
      [3,1,0,3,2,0],
      [1,3,1,2,0,2],
      [2,1,3,0,2,1]
    ])
  },
  {
    displayName: 'Truchet 3',
    state: stateFromPattern([
      [1,2,1,3,0,3,0,2,1,2],
      [0,1,3,1,2,1,2,0,2,3],
      [1,3,1,3,0,3,0,2,0,2],
      [3,1,3,1,2,1,2,0,2,0],
      [2,0,2,0,1,2,3,1,3,1],
      [3,1,3,1,0,3,2,0,2,0],
      [2,0,2,0,3,0,3,1,3,1],
      [0,2,0,2,1,2,1,3,1,3],
      [1,0,2,0,3,0,3,1,3,2],
      [0,3,0,2,1,2,1,3,0,3]
    ])
  },
  {
    displayName: 'Truchet 4',
    state: stateFromPattern([
      [3,1,1,3,1,2,0,2,2,0],
      [1,1,3,1,3,0,2,0,2,2],
      [1,3,1,3,1,2,0,2,0,2],
      [3,1,3,1,1,2,2,0,2,0],
      [1,3,1,1,3,0,2,2,0,2],
      [0,2,0,0,2,1,3,3,1,3],
      [2,0,2,0,0,3,3,1,3,1],
      [0,2,0,2,0,3,1,3,1,3],
      [0,0,2,0,2,1,3,1,3,3],
      [2,0,0,2,0,3,1,3,3,1]
    ])
  },
  {
    displayName: 'Truchet 5',
    state: stateFromPattern([
      [3,1,2,1,2,0],
      [1,3,0,3,0,2],
      [0,2,3,0,1,3],
      [1,3,2,1,0,2],
      [0,2,1,2,1,3],
      [2,0,3,0,3,1]
    ])
  },
  {
    displayName: 'Truchet 6',
    state: stateFromPattern([
      [1,2,1,2,1,2,3,0,3,0,3,0],
      [0,3,3,0,0,3,2,1,1,2,2,1],
      [1,3,1,2,0,2,3,1,3,0,2,0],
      [0,2,0,3,1,3,2,0,2,1,3,1],
      [1,2,2,1,1,2,3,0,0,3,3,0],
      [0,3,0,3,0,3,2,1,2,1,2,1],
      [3,0,3,0,3,0,1,2,1,2,1,2],
      [2,1,1,2,2,1,0,3,3,0,0,3],
      [3,1,3,0,2,0,1,3,1,2,0,2],
      [2,0,2,1,3,1,0,2,0,3,1,3],
      [3,0,0,3,3,0,1,2,2,1,1,2],
      [2,1,2,1,2,1,0,3,0,3,0,3]
    ])
  },
  {
    displayName: 'Concentric',
    state: stateFromQuadrant([1,0,2,3])
  },
  {
    displayName: 'Concentric 2',
    state: stateFromQuadrant([1,0,0,1])
  },
  {
    displayName: 'Cubes?',
    state: stateFromPattern([
      [1,2],
      [0,3],
      [2,1],
      [3,0]
    ])
  },
  {
    displayName: 'Contrast',
    state: stateFromQuadrant([0,3,1,2])
  },
  {
    displayName: 'Inwards',
    state: stateFromQuadrant([0,1,3,2])
  },
  {
    displayName: 'Like Truchet 5',
    state: stateFromPattern([
      [3,1,2,1,2,0],
      [1,3,0,3,0,2],
      [0,2,1,2,1,3],
      [1,3,0,3,0,2],
      [0,2,1,2,1,3],
      [2,0,3,0,3,1]
    ])
  },
  {
    displayName: 'Vines',
    state: function (i, j) {
      return j%2 ? i%2 : i%2+2;
    }
  }
];