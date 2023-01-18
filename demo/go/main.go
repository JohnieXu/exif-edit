package main

import (
	"fmt"
	"image/jpeg"
	"log"
	"os"
)

func readJpg() {
	fp := "../demo2.jpg"
	file, err := os.ReadFile(fp)
	if err != nil {
		log.Fatal("打开文件失败")
	}
	// fmt.Printf("\n%b", file)
	fmt.Printf("打开文件 %v 成功\n", fp)
	fmt.Printf("\n%x\n", file)

	fmt.Printf("\n")

	// fmt.Printf("转为 UIT-8 格式")
	// fmt.Print(string(file))

	fmt.Printf("\n")

	ff(file)
}

func ff(file []byte) {
	for i := 0; i < len(file); i += 2 {
		fmt.Printf("[%v] = %X%X", i, file[i], file[i+1])
		// a := fmt.Append(file[i], file[i+1])
		// if a == "\xFFE1" {
		// 	fmt.Printf("\n[%v] = %X%X", i, file[i], file[i+1])
		// }
	}
}

func main() {
	s := "ÿØ"

	fmt.Printf("ÿØ: %b\n", []byte(s))
	// fmt.Printf("2: %b \n16: %x \n", []byte(s), []byte(s))

	for _, v := range s {
		fmt.Printf("%c: %U \n", v, v)
	}

	readJpg()

	f, _ := os.Open(("../demo1.jpg"))

	image, _ := jpeg.Decode(f)

	b := image.Bounds()
	cm := image.ColorModel()

	max := b.Max
	// min := b.Min

	for i := 0; i < max.X; i++ {
		for j := 0; j < max.Y; j++ {
			r, g, b, a := image.At(i, j).RGBA()
			fmt.Printf("\n\n[%d,%d] = rgba(%d,%d,%d,%d)\n", i, j, r, g, b, a)
		}
	}

	fmt.Printf("\nbounds: %v \ncolorModel: %v\nimage: %v\n", b, cm, image)

}
