package main

import "fmt"

func main() {
	s := "ÿØ"

	fmt.Printf("ÿØ: %b\n", []byte(s))
	// fmt.Printf("2: %b \n16: %x \n", []byte(s), []byte(s))

	for _, v := range s {
		fmt.Printf("%c: %U \n", v, v)
	}

}
