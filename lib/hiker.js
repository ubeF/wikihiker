import { Page } from "./parse.js";

class Node {
    constructor(page, parent) {
        this.page = page;
        this.parent = parent;
    }

    async getChildren() {
        await this.page.load();
        const references = this.page.getReferences();
        return references.map((page) => new Node(page, this));
    }

    getURL() {
        return this.page.url;
    }

    printTrace() {
        let trace = [];
        for (let node = this; node != null; node = node.parent){
            trace.unshift(node);
        }
        for (let i in trace) {
            console.log(`${i} ${trace[i].page.url.toString()}`);
        }
    }
}

export async function search(entry, target, height){
    // let queue = [];
    // queue.push(new Node(new Page(entry), null));

    // for (let i = 0; i < depth; i++) {
    //     let children = [];

    //     console.log(`==== LAYER ${i} Searching ${queue.length} pages ====`);

    //     for(let node of queue) {
    //         const results = await node.getChildren();
    //         console.log(`Found ${results.length} references in ${node.getUrl().toString()}`);
    //         for(const candidate of results) {
    //             if(candidate.getURL().pathname === target.pathname) {
    //                 return candidate;
    //             }
    //         }
    //         children = children.concat(results);
    //     }

    //     queue = children;
    // }
    
    let start = new Node(new Page(entry), null);
    return await travel(start, target, height);
}

async function travel(node, target, height) {
    if(node.getURL().pathname === target.pathname) {
        return node;
    } else if (height === 0) {
        return undefined;
    } else {
        console.log(`==== HEIGHT ${height}: Searching ${node.getURL().pathname} ====`)
        const children = await node.getChildren();
        console.log(`Found ${children.length} references`);
        for (const child of children) {
            const result = await travel(child, target, height-1);
            if (result != undefined) {
                return result;
            }
        }
        return undefined;
    }
}