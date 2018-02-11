/* Topic Object */

export default class Topic {

    constructor(data) {

        this.title = data.title || data.getElementsByTagName('title')[0].textContent;

        this.url = data.url || data.getElementsByTagName('guid')[0].textContent;

        this.description = data.description || data.getElementsByTagName('description')[0].textContent;

        this.author = data.author || data.getElementsByTagName('author')[0].textContent.trim() // Why ? Best XML ever.. LOL

        this.date = data.date || data.getElementsByTagName('pubDate')[0].textContent;

        this.new = data.new || true;

        this.visited = data.visited || false;

        this.id = data.id || Math.floor(Math.random() * (1000000000 - 1 + 1)) + 1;

        this.node = this.newNode();
    }

  	newNode() {
  		let article = document.createElement('a');
        article.classList.add('topic');
        article.setAttribute('href', this.url);

        if (this.visited) {
            article.classList.add('visited');
        }

        let pTitle = document.createElement('p');
        pTitle.classList.add('topic_title');
        pTitle.textContent = this.title;
        article.appendChild(pTitle);

        let pAuthor = document.createElement('p');
        pAuthor.classList.add('topic_author');
        pAuthor.textContent = this.author;
        article.appendChild(pAuthor);

        let pDescription = document.createElement('p');
        pDescription.classList.add('topic_description');
        if (this.description.length > 30) {
            pDescription.textContent = this.description.slice(0, 100)+'...';
        } else {
            pDescription.textContent = this.description;
        }
        article.appendChild(pDescription);

       	return article;
  	}

    redirection() {
        this.visited = true;
        this.node.classList.add('visited');
        chrome.tabs.create({
            active: true,
            url: this.url,
            pinned: false
        });
    }
}