class Card {
    constructor(data) {
        this.buildElement();
        this.title = data.title || "New Card";
        this.description = data.desc || "A blank new card.";
        this.created = data.created || Date.now();
    }
    
    buildElement() {
        if(!this.element) {
            const container = document.createElement("div");
            container.classList.add("card");

            container.addEventListener("click", this.clickAction);

            this.element = container;
        }
        return this.element;
    }

    clickAction(evt) {
        alert("clicked");
    }

    set title(text) {
        this.element.innerText = text;
        this._title = text;
    }

    get title() {
        return this._title;
    }

    set description(desc) {
        this.element.innerText += "\n" + desc;
        this._description = desc;
    }

    get description() {
        return this._description;
    }

    toJSON() {
        return {
            "title": this.title,
            "desc": this.description,
            "created": this.created
        }
    }
}