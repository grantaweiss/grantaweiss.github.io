class List {
    constructor(data) {
        this.buildElement();
        this.title = data.title;
        this.cardList = [];
    }

    // Add a card to this list
    addCard() {
        let data = {};
        data.title = "New Card";
        const card = new Card(data);
        this.cardList.push(card);
        this.element.insertChildAtIndex(card.element, -1);
    }

    buildElement() {
        if(!this.element) {
            const container = document.createElement("div");
            container.classList.add("column");
            const header = document.createElement("div");
            header.classList.add("column-header");
            const headerText = document.createElement("div");
            headerText.classList.add("col-head-text");

            container.appendChild(header);
            header.appendChild(headerText);

            this.element = container;
        }
        return this.element;
    }

    /**
     * @param {string} newTitle
     */
    set title(newTitle) {
        this.element.querySelector(".col-head-text").innerText = newTitle;
    }

    static async buildFromJson(json) {
        const myList = new List(json);
        return myList;
    }
}