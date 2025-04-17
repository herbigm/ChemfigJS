# ChemfigJS

Programs with a GUI (graphical user interface) are often used to create chemical structural formulas on a PC. An alternative to this is the LaTeX package chemfig, which uses the typical LaTeX formats as output and can be converted into image files. For web applications, there is currently only the option of integrating comprehensive Javascript libraries or inserting images of the structural formulas. 
ChemfigJS is intended to close this gap. Based on the syntax of chemfig, an SVG is generated directly from the code. Only a few points deviate from the chemfig syntax. The library is kept as small as possible and should still offer as many options as possible.

The project is currently under active development. Collaboration is welcome.

## Features

+ create SVG on-the-fly
+ draw single, double and triple bonds
+ draw lone pairs and charges on atoms
+ draw rings
+ connect distant atoms
+ color atoms and bonds

## Not-Yet Features

+ anellated rings (workaround present)
+ more styling options
+ polymer brackets

## Installation
Include ChemfigJS.js in your document
```html
<script src="ChemfigJS.js"></script>
```

Execute the *INITchemfig()* function onload. 

All code in Containes of the class *chemfig* will be interpreted as formula and replced by a SVG. 
```html
<span class="chemfig">
*6(-=-(-OH)=(-(-[::60]OH)=[::-60]O)-=)    
</span>
```

## Syntax
The syntax is mostly the same as in the [chemfig](https://ctan.org/tex-archive/macros/generic/chemfig) LaTeX package.

### General Styling
There are a few classes inside the SVG wich can be styled using CSS. You can find an example in *style.css*:

```css
svg .textNode {
  stroke:white; 
  stroke-width:0.5em; 
  paint-order:stroke;
  font-size: 12pt;
}

svg .charge {
  font-size: x-small;
}
```

There are also some settings you may change:

```javascript
const bondLength = 30; // length of a bond
const padding = 20; // padding around the drawing
const fontSize = 16; // = 12pt, standard font size in SVG
const bondSep = 1; // px of separation of bond lines for double and triple bonds
```

### Bonds
There are three types of bonds:

| Bond type | code |
|:----|:----|
| single bond | - |
| double bond | = |
| triple bond | ~ |

These bonds are the essential part of forming the structures.

#### Styling
After each bond, optional arguments can be used in brackets *[]*. At the moment only two options are implemented, separated by comma (,):

1) The first argument is the direction (angle) for the bond: *:60* means 60° refering to a horizonal line from left to right (= absolute angle); *::60* means 60° refering to the direction of the last bond (= relative angle) and *1* (any integer *i*) means *i* times 45° absolute angle.
2) The second argument is the color of the bond. Use *white* to get an "invisible" bod on a white background aso.

### Atoms
After a bond (and optional arguments) text nodes can be set, e. g. as atoms. Just Write the text in the code. At the moment, there is no possibility to connect bonds to a distinct character of the text.

#### Lone Pairs and Charges
After the text nodes, optional arguments can be set in brackets *[]*. The first agrument is the definition of lone pairs and charges. The definition consists of an angle around the atom + a */*  + the charge (2+/+/-) or a vertical line (|) for a lone pair.

#### Styling
The second optional argument is the color for the text node including lone pairs and charges.

### Chains and Branches
Initially, the code consists of a main branch. Subbranches can be defined in parentheses *()*. Subsubbraches aso. are also possible. 

### Rings
As in che *chemfig* package, rings are defined with _*_ + int(ring size) + *(* ring code *)*. Substituents can be added in the ring code as subbranches. The direction of the first bond of a substituent is calculated internally but may be changed by using optional arguments (see above).

#### Anellated Ring Workaround
To draw anellated rings, draw a ring and the second ring as subbrach. This will result in a *spiro* compound. With the optional arguments of the bond, rotate the second ring until it is anelated to the first one. You may not want to write the last bond in the ring code of the second ring to get the best results.

### Connecting distant atoms
For connecting distant atoms, just write a question mark at the positions which should be connected. The first occurence of a question mark will set an anchor to the position and all following positions of question marks will be connected to the first one. 
