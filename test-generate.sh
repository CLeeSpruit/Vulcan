#!/bin/bash

rm -rf test || true
mkdir test
cd test
vulcan generate cli-utility
