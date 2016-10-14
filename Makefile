.DELETE_ON_ERROR:

js := \
lib/datastream.js \
lib/math.js \
lib/emd/section0.js \
lib/emd/section1.js \
lib/psx/tmd.js \
lib/psx/tim.js \
lib/emd/emd.js \
lib/mesh.js \
lib/model.js \
main.js

common.js: $(js)
	babel --presets latest --plugins transform-es2015-modules-umd $^ > $@
