class SearchView {
  #parentEl = document.querySelector('.search');

  getQuery() {
    const query = this.#parentEl.querySelector('input').value;
    console.log(this.#parentEl.querySelector('input').value);
    this.#clearInput();
    return query;
  }

  #clearInput() {
    this.#parentEl.querySelector('.search__field').value = '';
  }

  addHandlerSearch(handler) {
    this.#parentEl
      .querySelector('button')
      .addEventListener('click', function (e) {
        e.preventDefault();
        handler();
      });
  }
}

export default new SearchView();
