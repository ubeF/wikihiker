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
}

export async function search(entry, target, depth){
    let queue = [];
    queue.push(new Node(new Page(entry), null));

    while(queue.length > 0 && depth > 0) {
        const node = queue.shift();

        const results = await node.getChildren();
        for(const candidate of results) {
            if(candidate.getURL().pathname === target.pathname) {
                return candidate;
            }
        }

        queue = queue.concat(results);
        depth--;
    }
}