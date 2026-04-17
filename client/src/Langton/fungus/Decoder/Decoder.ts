import lexicon from "./lexicon";
import { parseSections } from "./Parser";
import { Cell } from "../LangstonFungus";

/*
sections = ["Directions:", "Actions:", "Resources:", "Operators:", "Examples:"];
const ps = parseSections(lexicon, sections);

function splitSec = (sec: string): string[] => sec.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
const Directions = splitSec(ps["Directions:"]) ?? "";
const Actions = splitSec(ps["Actions:"]) ?? "";
const Resources = splitSec(ps["Resources:"]) ?? "";
const Operators = splitSec(ps["Operators:"]) ?? "";

export default function decode(seq: string, Cell cell): () => void {

};
*/