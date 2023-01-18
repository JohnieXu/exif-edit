package main

import (
	"fmt"
	"log"
	"os"

	"github.com/rwcarlsen/goexif/exif"
	"github.com/rwcarlsen/goexif/mknote"
)

func main() {
	fpath := "../demo1.jpg"
	f, err := os.Open(fpath)
	if err != nil {
		log.Fatal(err)
	}

	exif.RegisterParsers(mknote.All...)

	x, err := exif.Decode(f)
	if err != nil {
		log.Fatal((err))
	}

	focal, err := x.Get(exif.FocalLength)
	if err != nil {
		log.Fatal((err))
	}

	numer, denom, err := focal.Rat2(0) // retrieve first (only) rat. value
	if err != nil {
		log.Fatal((err))
	}

	fmt.Printf("%v/%v", numer, denom)

}
