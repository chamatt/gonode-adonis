#!/bin/bash

if [ $ENV = "dev" ]; then
   npm run serve:dev
else
   adonis serve
fi
