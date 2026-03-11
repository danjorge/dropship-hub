#!/bin/sh
npx http-server dist -p ${PORT:-3000} --host 0.0.0.0 --proxy http://localhost:${PORT:-3000}?
