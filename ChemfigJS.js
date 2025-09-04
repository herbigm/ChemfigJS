function INITchemfig() {
    const spans = document.querySelectorAll(".chemfig");
    for (const span of spans) {
        let tree = getBranch(span.innerText);
        let rootNode = tree[0];
        if (tree[1].length > 0) {
            alert("could not parse string correctly: \""+span.innerText+"\"");
            return;
        }
        generateNodesInBranch(rootNode);
        console.log(rootNode)
        const nodes = sumUpNodes(rootNode)
        span.innerHTML = "";
        draw(span, nodes[0], nodes[1]);
    }
}

const bondLength = 30;
const padding = 20;
const fontSize = 16; // = 12pt
const bondSep = 1;

let fixedPosition = false;

function TextNode(c) {
    this.code = c;
    this.x = 0;
    this.y = 0;
}

function Bond(c) {
    this.code = c;
    this.startX = 0;
    this.startY = 0;
    this.endX = 0;
    this.endY = 0;
    this.type = "-";
    this.options = [];
}

function Branch(pos) {
    if (!pos) {
        pos = 0;
    }
    this.code = "";
    this.subbranches = [];
    this.bonds = [];
    this.textNodes = [];
    this.positionInParentCode = pos;
    this.specialAngle = 0;
}

function getBranch(code, pos) {
    if (!pos)
        pos = 0;
    let branch = new Branch(pos);

    while (code.length > 0) {
        if (code[0] == "(") {
            let subbranch = getBranch(code.substr(1), branch.code.length);
            branch.subbranches.push(subbranch[0]);
            code = subbranch[1];
        } else if (code[0] == ")") {
            return [branch, code.substr(1)];
        } else if (code[0] == "*") {
            let m = code.match(/\*(\d+)\(/ui);
            if (m) {
                const edges = parseInt(m[1]);
                let subbranch = getBranch(code.substr(m[0].length), branch.code.length);
                subbranch[0].specialAngle = (edges - 2) / edges * 180;
                branch.subbranches.push(subbranch[0]);
                code = subbranch[1];
            }
        } else {
            branch.code += code[0];
            code = code.substr(1);
        }
    }
    return [branch, ""];
}

function generateNodesInBranch(branch, rx, ry, rangle) {
    if (!rx) // root x
        rx = 0;
    if (!ry) // root y
        ry = 0;
    if (!rangle) // root angle
        rangle = 0;
    
    let code = branch.code;
    const codeLength = code.length;

    let cx = rx; // current x
    let cy = ry; // current y
    let cangle = rangle; // current angle
    
    const re = /^(-|=|~)(?:\[(.*?)\])?/ui;
    
    while (code.length > 0) {

        // generate subbranches
        const pos = codeLength - code.length; //  = position in original code
        for (let b of branch.subbranches) {
            if (pos == b.positionInParentCode) { // if in right position, generatre subbranches' nodes
                if (branch.specialAngle > 0) {
                    generateNodesInBranch(b, cx, cy, cangle - branch.specialAngle / 2);
                } else {
                    generateNodesInBranch(b, cx, cy, cangle);
                }
            }
        }

        let m = code.match(re);
        if (m) {
            code = code.substring(m[0].length);
            let b = new Bond(m[0]);
            b.type = m[1];
            b.options = m[2];
            if (b.options) {
                b.options = b.options.split(",");
                if (b.options.length >= 1) {
                    if (b.options[0].startsWith("::"))
                        cangle += parseFloat(b.options[0].substring(2));
                    else if (b.options[0].startsWith(":"))
                        cangle = parseFloat(b.options[0].substring(1));
                    else 
                        cangle = parseInt(b.options[0]) * 45;
                } else {
                    cangle = 0;
                }
            } else {
                b.options = [];
            }
            if (branch.specialAngle > 0) {
                if (pos == 0) {
                    cangle -= (branch.specialAngle / 2);
                } else {
                    cangle += (180 - branch.specialAngle);
                }
            }
            if (b.type == "-") {
                // singe bond
                b.startX = cx;
                b.startY = cy;

                b.endX = b.startX + Math.round((Math.cos(cangle * Math.PI / 180) * bondLength));
                b.endY = b.startY + Math.round((Math.sin(cangle * Math.PI / 180) * bondLength));

                cx = b.endX;
                cy = b.endY;

                branch.bonds.push(b);
            } else if (b.type == "=") {
                // double bond
                startx = cx;
                starty = cy;

                // calculate new position for next atom
                cx = cx + Math.round((Math.cos(cangle * Math.PI / 180) * bondLength));
                cy = cy + Math.round((Math.sin(cangle * Math.PI / 180) * bondLength));

                // first bond
                b1 = JSON.parse(JSON.stringify(b));
                b1.startX = startx + Math.round((Math.cos((cangle + 90) * Math.PI / 180) * bondSep));
                b1.startY = starty + Math.round((Math.sin((cangle + 90) * Math.PI / 180) * bondSep));
                b1.endX = b1.startX + Math.round((Math.cos(cangle * Math.PI / 180) * bondLength));
                b1.endY = b1.startY + Math.round((Math.sin(cangle * Math.PI / 180) * bondLength));
                branch.bonds.push(b1);

                // second bond
                b2 = JSON.parse(JSON.stringify(b));
                b2.startX = startx - Math.round((Math.cos((cangle + 90) * Math.PI / 180) * bondSep));
                b2.startY = starty - Math.round((Math.sin((cangle + 90) * Math.PI / 180) * bondSep));
                b2.endX = b2.startX + Math.round((Math.cos(cangle * Math.PI / 180) * bondLength));
                b2.endY = b2.startY + Math.round((Math.sin(cangle * Math.PI / 180) * bondLength));
                branch.bonds.push(b2);
            } else if (b.type = "~") {
                // triple bond
                startx = cx;
                starty = cy;

                // calculate new position for next atom
                cx = cx + Math.round((Math.cos(cangle * Math.PI / 180) * bondLength));
                cy = cy + Math.round((Math.sin(cangle * Math.PI / 180) * bondLength));

                // first bond
                b1 = JSON.parse(JSON.stringify(b));
                b1.startX = startx + Math.round((Math.cos((cangle + 90) * Math.PI / 180) * bondSep * 2));
                b1.startY = starty + Math.round((Math.sin((cangle + 90) * Math.PI / 180) * bondSep * 2));
                b1.endX = b1.startX + Math.round((Math.cos(cangle * Math.PI / 180) * bondLength));
                b1.endY = b1.startY + Math.round((Math.sin(cangle * Math.PI / 180) * bondLength));
                branch.bonds.push(b1);

                // second bond
                b2 = JSON.parse(JSON.stringify(b));
                b2.startX = startx - Math.round((Math.cos((cangle + 90) * Math.PI / 180) * bondSep * 2));
                b2.startY = starty - Math.round((Math.sin((cangle + 90) * Math.PI / 180) * bondSep * 2));
                b2.endX = b2.startX + Math.round((Math.cos(cangle * Math.PI / 180) * bondLength));
                b2.endY = b2.startY + Math.round((Math.sin(cangle * Math.PI / 180) * bondLength));
                branch.bonds.push(b2);

                b.startX = startx;
                b.startY = starty;
                b.endX = b.startX + Math.round((Math.cos(cangle * Math.PI / 180) * bondLength));
                b.endY = b.startY + Math.round((Math.sin(cangle * Math.PI / 180) * bondLength));
                branch.bonds.push(b);
            }
            
        } else {
            let tnc = code[0];
            if (tnc == "?") {
                if (!fixedPosition) {
                    fixedPosition = [cx, cy];
                } else {
                    let b = new Bond("-");
                    b.startX = fixedPosition[0];
                    b.startY = fixedPosition[1];
                    b.endX = cx;
                    b.endY = cy;
                    branch.bonds.push(b);
                }
            }
            let bracketCount = 0;
            code = code.substring(1);
            while (!code.match(re) && code.length > 0) {
                if (code[0] == "[") {
                    tnc += code[0];
                    code = code.substring(1);
                    while (code[0] != "]") {
                        tnc += code[0];
                        code = code.substring(1);
                    }
                }
                if (code[0] == "?") {
                    if (!fixedPosition) {
                        fixedPosition = [cx, cy];
                    } else {
                        let b = new Bond("-");
                        b.startX = fixedPosition[0];
                        b.startY = fixedPosition[1];
                        b.endX = cx;
                        b.endY = cy;
                        branch.bonds.push(b);
                    }
                } else {
                    tnc += code[0];
                }
                code = code.substring(1);
            }
            let tn = new TextNode(tnc)
            tn.x = cx;
            tn.y = cy;
            branch.textNodes.push(tn);
        }
    }
    // generate subbranches
    const pos = codeLength - code.length; //  = position in original code
    for (let b of branch.subbranches) {
        if (pos == b.positionInParentCode) { // if in right position, generatre subbranches' nodes
            if (branch.specialAngle > 0) {
                generateNodesInBranch(b, cx, cy, cangle - branch.specialAngle / 2);
            } else {
                generateNodesInBranch(b, cx, cy, cangle);
            }
        }
    }
}

function sumUpNodes(branch) {
    let textNodes = branch.textNodes;
    let bonds = branch.bonds;
    for (let b of branch.subbranches) {
        const n = sumUpNodes(b);
        textNodes = textNodes.concat(n[0]);
        bonds = bonds.concat(n[1]);
    }

    return [textNodes, bonds];
}

function draw(parent, textNodes, bonds) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;

    for (const b of bonds) {
        let line = document.createElementNS('http://www.w3.org/2000/svg',"line");
        line.setAttribute("x1", b.startX);
        line.setAttribute("y1", b.startY);
        line.setAttribute("x2", b.endX);
        line.setAttribute("y2", b.endY);
        if (b.options.length > 1) {
            line.setAttribute("stroke", b.options[1]);
        } else {
            line.setAttribute("stroke", "black");
        }
        svg.appendChild(line);

        if (b.startX < minX) {
            minX = b.startX;
        }
        if (b.endX < minX) {
            minX = b.endX;
        }
        if (b.startX > maxX) {
            maxX = b.startX;
        }
        if (b.endX > maxX) {
            maxX = b.endX;
        }
        if (b.startY < minY) {
            minY = b.startY;
        }
        if (b.endY < minY) {
            minY = b.endY;
        }
        if (b.startY > maxY) {
            maxY = b.startY;
        }
        if (b.endY > maxY) {
            maxY = b.endY;
        }
    }

    for (const tn of textNodes) {
        let text = document.createElementNS('http://www.w3.org/2000/svg',"text");
        text.setAttribute("x", tn.x);
        text.setAttribute("y", tn.y + fontSize/2.0);
        text.setAttribute("text-anchor", "middle");
        text.classList.add("textNode");
        text.textContent = tn['code'];

        // interpret text appendix (+-|)
        const re = /([A-Z][a-z]?)(?:\[(.*?)\])?/ui;
        const re2 = /([\-\d]+)\/(\||\d?\+|\d?-)/gui;
        let m = tn['code'].match(re);
        if(m) {
            if (m[2]) {
                let options = m[2].split(/\s*,\s*/gui);
                if (options.length > 0) {
                    for (const opt of options[0].matchAll(re2)) {
                        if (opt[2].endsWith("+") || opt[2].endsWith("-")) {
                            const alpha = parseFloat(opt[1]);
                            const optX = tn.x + Math.round((Math.cos(alpha * Math.PI / 180) * fontSize));
                            const optY = tn.y + Math.round((Math.sin(alpha * Math.PI / 180) * fontSize));
                            let optText = document.createElementNS('http://www.w3.org/2000/svg',"text");
                            optText.setAttribute("x", optX);
                            optText.setAttribute("y", optY + fontSize/2.0);
                            optText.setAttribute("text-anchor", "middle");
                            optText.classList.add("charge");
                            if (options.length > 1) {
                                optText.setAttribute("fill", options[1]);
                            }
                            optText.textContent = opt[2];
                            svg.appendChild(optText);
                        } else if (opt[2] == "|") {
                            const alpha = parseFloat(opt[1]);
                            const startX = tn.x + Math.round((Math.cos((alpha + 30) * Math.PI / 180) * fontSize * 0.75));
                            const startY = tn.y + Math.round((Math.sin((alpha + 30) * Math.PI / 180) * fontSize * 0.75)) + fontSize/8;
                            const endX = tn.x + Math.round((Math.cos((alpha - 30) * Math.PI / 180) * fontSize * 0.75));
                            const endY = tn.y + Math.round((Math.sin((alpha - 30) * Math.PI / 180) * fontSize * 0.75)) + fontSize/8;
                            let line = document.createElementNS('http://www.w3.org/2000/svg',"line");
                            line.setAttribute("x1", startX);
                            line.setAttribute("y1", startY);
                            line.setAttribute("x2", endX);
                            line.setAttribute("y2", endY);
                            if (options.length > 1) {
                                line.setAttribute("stroke", options[1]);
                            } else {
                                line.setAttribute("stroke", "black");
                            }
                            svg.appendChild(line);
                        }
                    }
                }
                if (options.length > 1) {
                    text.setAttribute("fill", options[1]);
                }
            }
            text.textContent = m[1];
            svg.appendChild(text);
        }

        if (tn.x < minX) {
            minX = tn.x;
        }
        if (tn.x > maxX) {
            maxX = tn.x;
        }
        if (tn.y < minY) {
            minY = tn.y;
        }
        if (tn.y > maxY) {
            maxY = tn.y;
        }
    }

    // add padding
    minX -= fontSize * 2;
    maxX += fontSize * 2;
    minY -= fontSize * 2;
    maxY += fontSize * 2;

    svg.setAttribute("viewBox", minX + " " + minY + " " + (maxX-minX) + " " + (maxY-minY));
    svg.setAttribute("width", (maxX-minX));
    svg.setAttribute("height", (maxY-minY));
    parent.appendChild(svg);
}

window.getBranch = getBranch;
