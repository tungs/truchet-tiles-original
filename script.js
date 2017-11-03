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

var rows = 10;
var columns = 10;
var planeDistance = 500;
var floatHeight = 20;
var tileSpacing = 22;
var screenTileSize = 20;
var maximumSharableRows = 20;
var maximumSharableColumns = 20;
var numRotateStates = 4;
var autoplaying = false;
var autoplayDelays = [7500, 6000, 4500, 3000, 1500, 975, 750, 500, 375, 215, 150, 50];
var switchSpeeds = [2500, 2000, 1500, 1000, 500, 325, 250, 125, 75, 50];
var switchFrequencies = [8000, 2000, 1000, 600, 500, 400, 350, 300, 250, 200, 150, 125, 100, 80, 65, 25, 12]; // milliseconds between tile switching
var rotateX = 50, rotateY = 0;

var hashString = window.location.hash;
var urlKeyPairs = {};
if (hashString) {
  hashString.substr(1).split('&').forEach(function (item) {
    var components = item.split('=');
    if (components.length === 2) {
      urlKeyPairs[components[0]] = components[1];
    }
  });
}

if (urlKeyPairs.rows !== undefined) {
  if (+urlKeyPairs.rows <= maximumSharableRows) {
    rows = +urlKeyPairs.rows;
  }
}

if (urlKeyPairs.columns !== undefined) {
  if (+urlKeyPairs.columns <= maximumSharableColumns) {
    columns = +urlKeyPairs.columns;
  }
}

autoplaying = !!urlKeyPairs.autoplay;

var getElementById = function (id) {
  return document.getElementById(id);
};

var createElement = function (type) {
  return document.createElement(type);
};

var preventDefault = function (event) {
  if (event.preventDefault) {
    event.preventDefault();
  }
};

var manualSwitchType = getElementById('manualSwitchType');
var container = getElementById('container');
var plane = getElementById('plane');
var switchPreset = getElementById('switchPreset');
var autoplayCheckbox = getElementById('autoplay');
var colorsSelect = getElementById('colorsSelect');
var switchStyle = getElementById('switchStyle');
var rowsInput = getElementById('rowsInput');
var columnsInput = getElementById('columnsInput');
var rotationControl = getElementById('rotationControl');
var switchFrequencyInput = getElementById('switchFrequencyInput');
var switchSpeedInput = getElementById('switchSpeedInput');
var autoplayDelayInput = getElementById('autoplayDelay');

var updatePlaneTransform = function () {
  plane.style.transformOrigin = (+columns * tileSpacing/2) + 'px ' + (+rows * tileSpacing/2) + 'px 0';
  plane.style.transform = 'translateZ(-' + planeDistance + 'px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
};
updatePlaneTransform();

var resizeContainer = function () {
  container.style.width = (columns * screenTileSize) + 'px';
  container.style.height = (rows * screenTileSize) + 'px';
};
resizeContainer();

var animationQueue = [];

var addToAnimationQueue = function (fn) {
  animationQueue.push(fn);
};

var binnedTime;
var runAnimations = function () {
  binnedTime = (new Date()).getTime();
  requestAnimationFrame(runAnimations);
  var oldAnimations = animationQueue;
  animationQueue = [];
  oldAnimations.forEach(function (fn) {
    fn();
  });
};
runAnimations();

var easeIn = function (pow) {
  return function (t) {
    return Math.pow(t, pow);
  };
};

var easeOut = function (pow) {
  return function (t) {
    return 1 - Math.pow(1-t, pow);
  };
};

var easeInOut = function (pow) {
  return function (t) {
    if (t < 0.5) {
      return easeIn(pow)(2*t)/2;
    } else {
      return (easeOut(pow)(2*t - 1) + 1)/2;
    }
  };
};

var easing = easeInOut(2);

var mapState = function (fn) {
  var i, j;
  var ret = [];
  var row, item;
  for (j = 0; j< rows; j++) {
    row = [];
    for (i = 0; i < columns; i++) {
      item = fn(i, j, columns, rows);
      row.push(item);
    }
    ret.push(row);
  }
  return ret;
};

var targetPlaneState;
var targetPresetIndex = null;

var resizePlane = function (newCols, newRows) {
  var i, j, row, targetRow;
  for (j=newRows; j<tiles.length; j++) {
    for (i=0; i<tiles[j].length; i++) {
      tiles[j][i].remove();
    }
  }
  if (newRows < tiles.length) {
    tiles.splice(newRows, tiles.length - newRows);
    if (targetPlaneState) {
      targetPlaneState.splice(newRows, tiles.length - newRows);
    }
  }
  for (j = 0; j < tiles.length; j++) {
    for (i = newCols; i < tiles[j].length; i++) {
      tiles[j][i].remove();
    }
    if (newCols < tiles[j].length) {
      tiles[j].splice(newCols, tiles[j].length - newCols);
      if (targetPlaneState) {
        targetPlaneState[j].splice(newCols, tiles[j].length - newCols);
      }
    }
    for (i = tiles[j].length; i < newCols; i++) {
      tiles[j].push(createTile(i, j));
      if (targetPlaneState) {
        targetPlaneState[j].push(0);
      }
    }
  }
  for (j = tiles.length; j < newRows; j++) {
    row = [];
    targetRow = [];
    for (i = 0; i < newCols; i++) {
      row.push(createTile(i, j));
      targetRow.push(0);
    }
    tiles.push(row);
    if (targetPlaneState) {
      targetPlaneState.push(targetRow);
    }
  }
  rows = newRows;
  columns = newCols;
  resizeContainer();
  updatePlaneTransform();
  if (targetPresetIndex !== null) {
    targetPlaneState = mapState(presets[targetPresetIndex].state);
  }
  updateLocationFromPlane();
};

switchFrequencyInput.min = 0;
switchFrequencyInput.max = switchFrequencies.length - 1;
switchFrequencyInput.value = Math.max(0, switchFrequencies.length-3);

switchSpeedInput.min = 0;
switchSpeedInput.max = switchSpeeds.length - 1;
switchSpeedInput.value = Math.max(0, switchSpeeds.length-5);

autoplayDelayInput.min = 0;
autoplayDelayInput.max = autoplayDelays.length - 1;
autoplayDelayInput.value = Math.max(0, autoplayDelays.length-6);

if (urlKeyPairs.switchFrequencyIndex !== undefined) {
  switchFrequencyInput.value = Math.min(Math.max(0, urlKeyPairs.switchFrequencyIndex), switchFrequencies.length);
}

if (urlKeyPairs.switchSpeedIndex !== undefined) {
  switchSpeedInput.value = Math.min(Math.max(0, urlKeyPairs.switchSpeedIndex), switchSpeeds.length);
}

if (urlKeyPairs.autoplayDelayIndex !== undefined) {
  autoplayDelayInput.value = Math.min(Math.max(0, urlKeyPairs.autoplayDelayIndex), autoplayDelays.length);
}


presets.forEach(function (state, i) {
  var option = createElement('option');
  option.textContent = state.displayName;
  option.value = i;
  switchPreset.appendChild(option);
});

var updateLocation = function (config) {
  var key, hash = '';
  var components = [];
  for (key in config) {
    if (config.hasOwnProperty(key)) {
      components.push(encodeURIComponent(key) + '=' + encodeURIComponent(config[key]));
    }
  }
  if (components.length) {
    hash = '#' + components.join('&');
  }
  if (history.replaceState) {
    history.replaceState(null, null, hash);
  } else {
    window.location.hash = hash;
  }
};

var urlStateEncode = '0123456789abcdef';
var squaresPerCharacter = 2;
var updateLocationFromPlane = function () {
  var i, j, locationData = [];
  var sharableRows = Math.min(rows, maximumSharableRows);
  var sharableColumns = Math.min(columns, maximumSharableColumns);
  var charSquareCount = 0;
  var currentData = 0;
  for (j = 0; j < sharableRows; j++) {
    for (i = 0; i < sharableColumns; i++) {
      currentData = currentData * numRotateStates + (tiles[j][i].getTargetState()%numRotateStates);
      charSquareCount++;
      if (charSquareCount === squaresPerCharacter) {
        locationData.push(urlStateEncode.charAt(currentData));
        charSquareCount = 0;
        currentData = 0;
      }
    }
  }
  if (charSquareCount) {
    while (charSquareCount < squaresPerCharacter) {
      currentData = currentData * numRotateStates;
    }
    locationData.push(urlStateEncode.charAt(currentData));
  }
  updateLocation({
    rows: sharableRows,
    columns: sharableColumns,
    colors: colorsSelect.value,
    switchStyle: switchStyle.value,
    switchFrequencyIndex: switchFrequencyInput.value,
    switchSpeedIndex: switchSpeedInput.value,
    autoplay: autoplayCheckbox.checked,
    autoplayDelayIndex: autoplayDelayInput.value,
    state: locationData.join('')
  });
};
var decodePlaneCharacter = function (c) {
  var num = urlStateEncode.indexOf(c);
  var nums = [], i;
  if (num === -1) {
    num = 0;
  }
  for (i=0; i<squaresPerCharacter; i++) {
    nums.push(num % numRotateStates);
    num = Math.floor(num/numRotateStates);
  }
  return nums;
};
var setTargetStateFromPlaneData = function (data) {
  targetPlaneState = mapState(function () {
    return 0;
  });
  var i, j;
  var currentCharIndex = 0;
  var nums = [];
  for (j = 0; j < rows; j++) {
    for (i = 0; i < columns; i++) {
      if (!nums.length) {
        if (currentCharIndex < data.length) {
          nums = decodePlaneCharacter(data[currentCharIndex]);
        } else {
          nums = decodePlaneCharacter(urlStateEncode[0]);
        }
        currentCharIndex++;
      }
      targetPlaneState[j][i] = nums.pop();
    }
  }
};
var setStateClass = function (el, state) {
  if (numRotateStates === 2) {
    el.classList.toggle('state-2', state===1);
  } else {
    el.classList.toggle('state-1', state===1);
    el.classList.toggle('state-2', state===2);
    el.classList.toggle('state-3', state===3);
  }
};

var getEasedFloatTransform = function (t, floating) {
  var fraction;
  if (floating) {
    fraction = easing(t);
  } else {
    fraction = 1 - easing(t);
  }
  return 'translateZ(' + (floatHeight * fraction).toFixed(2) + 'px)';
};

var getEasedRotationTransform = function (t, previousRotated, rotated) {
  var fraction = easing(t);
  var startAngle = previousRotated * 90;
  var rotationDistance = rotated - previousRotated;
  if (rotationDistance > 2) {
    rotationDistance -= 4;
  } else if (rotationDistance < -2) {
    rotationDistance += 4;
  }
  var currentAngle = startAngle + (fraction * rotationDistance * 90);
  return 'rotateZ(' + currentAngle.toFixed(2) + 'deg)';
};

var createTile = function (i, j) {
  var rotateState = 0;
  var previousRotateState = rotateState;
  var running = false;
  var position = createElement('div');
  var tile = createElement('div');
  var top = createElement('div');
  var front = createElement('div');
  var back = createElement('div');
  var left = createElement('div');
  var right = createElement('div');
  var floatTransform = createElement('div');
  var img = createElement('img');
  var floatTransitionStartTime = null;
  var rotationTransitionStartTime = null;
  var floatDuration, rotationDuration;
  var floating = false;
  var targetState = 0;
  img.src = 'truchet_tile_original.svg';
  top.className = 'top';
  back.className = 'back';
  left.className = 'left';
  right.className = 'right';
  front.className = 'front';
  floatTransform.className = 'float-transform';
  top.appendChild(img);
  tile.className = 'tile';
  plane.appendChild(position);
  position.appendChild(floatTransform);
  floatTransform.appendChild(tile);
  tile.appendChild(top);
  tile.appendChild(front);
  tile.appendChild(back);
  tile.appendChild(left);
  tile.appendChild(right);
  position.className = 'position';
  var toggleState = function () {
    if (floatTransitionStartTime || rotationTransitionStartTime) {
      return;
    }
    targetState = (rotateState + 1) % numRotateStates;
    floatTransitionStartTime = binnedTime;
    floatDuration = switchSpeeds[switchSpeedInput.value];
    floating = true;
    updateLocationFromPlane();
    runAnimation();
  };
  var setState = function (state) {
    targetState = state;
    if (!floatTransitionStartTime && !rotationTransitionStartTime &&
      rotateState !== targetState) {
      floatTransitionStartTime = binnedTime;
      floatDuration = switchSpeeds[switchSpeedInput.value];
      floating = true;
      runAnimation();
    }
  };
  var runAnimation = function () {
    if (running) {
      return;
    }
    running = true;
    addToAnimationQueue(updateAnimation);
  };
  var getTargetState = function () {
    return targetState;
  };
  var updateAnimation = function () {
    var t;
    var transitionEndTime;
    if (!running) {
      return;
    }
    if (floatTransitionStartTime) {
      t = Math.min(1, (binnedTime - floatTransitionStartTime) / floatDuration);
      floatTransform.style.transform = getEasedFloatTransform(t, floating);
      if (t === 1) {
        transitionEndTime = floatTransitionStartTime + floatDuration;
        if (floating) {
          if (rotateState !== targetState) {
            floatTransitionStartTime = null;
            previousRotateState = rotateState;
            rotateState = targetState;
            setStateClass(tile, rotateState);
            rotationTransitionStartTime = transitionEndTime;
            rotationDuration = switchSpeeds[switchSpeedInput.value] * (Math.abs(previousRotateState - rotateState) === 2 ? 2 : 1);
            tile.classList.toggle('rotating', true);
          } else {
            rotationTransitionStartTime = null;
            floatTransitionStartTime = transitionEndTime;
            floatDuration = switchSpeeds[switchSpeedInput.value];
            floating = false;
            tile.classList.toggle('rotating', false);
          }
        } else {
          if (rotateState !== targetState) {
            floatTransitionStartTime = transitionEndTime;
            floatDuration = switchSpeeds[switchSpeedInput.value];
            rotationTransitionStartTime = null;
            floating = true;
          } else {
            floatTransitionStartTime = null;
            rotationTransitionStartTime = null;
          }
        }
      }
    }
    if (rotationTransitionStartTime) {
      t = Math.min(1, (binnedTime - rotationTransitionStartTime) / (rotationDuration));
      tile.style.transform = getEasedRotationTransform(t, previousRotateState, rotateState);
      if (t === 1) {
        transitionEndTime = rotationTransitionStartTime + (rotationDuration);
        if (rotateState !== targetState) {
          previousRotateState = rotateState;
          rotateState = targetState;
          setStateClass(tile, rotateState);
          rotationTransitionStartTime = transitionEndTime;
          rotationDuration = switchSpeeds[switchSpeedInput.value] * (Math.abs(previousRotateState - rotateState) === 2 ? 2 : 1);
          floatTransitionStartTime = null;
          tile.classList.toggle('rotating', true);
        } else {
          floatTransitionStartTime = binnedTime;
          floatDuration = switchSpeeds[switchSpeedInput.value];
          floating = false;
          rotationTransitionStartTime = null;
          tile.classList.toggle('rotating', false);
        }
      }
    }
    addToAnimationQueue(updateAnimation);
  };
  var remove = function () {
    running = false;
    tile.remove();
  };
  tile.addEventListener('mouseenter', function () {
    if (manualSwitchType.value !== 'hover') {
      return;
    }
    toggleState();
  });
  tile.addEventListener('click', function () {
    toggleState();
  });
  tile.addEventListener('touchstart', function (e) {
    e.preventDefault();
    toggleState();
  });
  position.style.transform = 'translateX( ' + i * tileSpacing + 'px) translateY( ' + j * tileSpacing + 'px )';
  setStateClass(tile, rotateState);
  return {
    getTargetState: getTargetState,
    setState: setState,
    remove: remove
  };
};

var tiles = mapState(function (i,j) {
  return createTile(i, j);
});

var presetTimeout;
var autoplayTimeout;
var switchToTargetState = function () {
  clearTimeout(presetTimeout);
  clearTimeout(autoplayTimeout);
  var switchSquare = function () {
    var i, j, ind;
    var switchType = switchStyle.value;
    var items = [], item;
    var speedTimeout = switchFrequencies[switchFrequencyInput.value];
    for (j = 0; j < rows; j++) {
      for (i = 0; i < columns; i++) {
        if (tiles[j][i].getTargetState() !== targetPlaneState[j][i]) {
          items.push({
            row: j,
            col: i
          });
        }
      }
    }
    if (items.length) {
      if (switchType === 'random') {
        ind = Math.floor(Math.random() * items.length);
      } else if (switchType === 'sequential') {
        ind = 0;
      } else if (switchType === 'outIn') {
        if (items.length % 2) {
          ind=0;
        } else {
          ind = items.length - 1;
        }
      } else if (switchType === 'inOut') {
        ind = Math.floor(items.length/2);
      }
      if (switchType === 'simultaneous') {
        items.forEach(function (item) {
          tiles[item.row][item.col].setState(targetPlaneState[item.row][item.col]);
        });
      } else {
        item = items[ind];
        tiles[item.row][item.col].setState(targetPlaneState[item.row][item.col]);
      }
      presetTimeout = setTimeout(switchSquare, Math.floor(Math.random()*25 + speedTimeout));
    } else {
      updatePlaneTransform();
      autoplayTimeout = setTimeout(function () {
        autoplayNext();
      }, autoplayDelays[autoplayDelayInput.value]);
    }
  };
  switchSquare();
};

var switchToStateInd = function (stateInd) {
  targetPresetIndex = stateInd;
  targetPlaneState = mapState(presets[stateInd].state);
  switchToTargetState();
};

var autoplayNext = function () {
  if (autoplayCheckbox.checked && presets.length && presets.length > 1) {
    var ind = Math.floor(Math.random()*presets.length);
    while(ind === +switchPreset.value) {
      ind = Math.floor(Math.random()*presets.length);
    }
    switchPreset.value = ind;
    switchToStateInd(ind);
  } else {
    targetPresetIndex = null;
  }
};

autoplayCheckbox.addEventListener('change', function () {
  autoplayDelayInput.disabled = !autoplayCheckbox.checked;
  autoplayNext();
});

var colorsSelectChanged = function () {
  var colorsType = colorsSelect.value;
  plane.classList.toggle('light-colors', colorsType==='light');
  plane.classList.toggle('deep-colors', colorsType==='deep');
};

colorsSelect.addEventListener('change', colorsSelectChanged);

rowsInput.value = rows;
columnsInput.value = columns;

rowsInput.addEventListener('change', function () {
  resizePlane(+columnsInput.value, +rowsInput.value);
});

columnsInput.addEventListener('change', function () {
  resizePlane(+columnsInput.value, +rowsInput.value);
});

var patternChanged = function () {
  switchToStateInd(+switchPreset.value);
};

switchPreset.addEventListener('change', patternChanged);

var previousRotationLocation = null;
var rotationLocationMouseDown;

var updateRotationLocation = function (point) {
  var dx, dy;
  if (point && previousRotationLocation) {
    dx = point.x - previousRotationLocation.x;
    dy = point.y - previousRotationLocation.y;
    rotateX -= dy;
    rotateY += dx;
    updatePlaneTransform();
  }
  previousRotationLocation = point;
};

rotationControl.addEventListener('mousedown', function (e) {
  e.preventDefault();
  rotationLocationMouseDown = true;
  updateRotationLocation({
    x: e.screenX,
    y: e.screenY
  });
});

rotationControl.addEventListener('mouseleave', function () {
  rotationLocationMouseDown = false;
  updateRotationLocation(null);
});

rotationControl.addEventListener('mouseup', function (e) {
  e.preventDefault();
  rotationLocationMouseDown = false;
  updateRotationLocation(null);
});

rotationControl.addEventListener('mousemove', function (e) {
  e.preventDefault();
  if (!rotationLocationMouseDown) {
    return;
  }
  updateRotationLocation({x: e.screenX, y: e.screenY});
});

var rotationControlTouchHandler = function (e) {
  e.preventDefault();
  var touches = e.targetTouches;
  if (touches && touches.length) {
    updateRotationLocation({
      x: touches[0].screenX,
      y: touches[0].screenY
    });
  } else {
    updateRotationLocation(null);
  }
};

rotationControl.addEventListener('touchstart', rotationControlTouchHandler);

rotationControl.addEventListener('touchend', function (e) {
  e.preventDefault();
  updateRotationLocation(null);
});

rotationControl.addEventListener('touchcancel', function (e) {
  e.preventDefault();
  updateRotationLocation(null);
});

rotationControl.addEventListener('touchmove', rotationControlTouchHandler);

container.addEventListener('touchmove', preventDefault);

autoplayCheckbox.addEventListener('change', updateLocationFromPlane);
autoplayDelayInput.addEventListener('change', updateLocationFromPlane);
switchStyle.addEventListener('change', updateLocationFromPlane);
switchFrequencyInput.addEventListener('change', updateLocationFromPlane);
switchSpeedInput.addEventListener('change', updateLocationFromPlane);
colorsSelect.addEventListener('change', updateLocationFromPlane);

if (urlKeyPairs.colors !== undefined) {
  colorsSelect.value = urlKeyPairs.colors;
  colorsSelectChanged();
}

if (urlKeyPairs.switchStyle !== undefined) {
  switchStyle.value = urlKeyPairs.switchStyle;
}

if (urlKeyPairs.state !== undefined) {
  setTargetStateFromPlaneData(urlKeyPairs.state);
  switchToTargetState();
}

if (autoplaying) {
  autoplayCheckbox.checked = true;
  if (urlKeyPairs.state === undefined) {
    autoplayNext();
  }
}

autoplayDelayInput.disabled = !autoplayCheckbox.checked;
