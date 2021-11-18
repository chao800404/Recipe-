import View from './view.js';
import icons from 'url:../../img/icons.svg';
class PaginationsView extends View {
  _parentElement = document.querySelector('.pagination');
  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }
  _generateMarkup() {
    // const numPages = Math.ceil(
    //   this._data.result.length / this._data.resultPerPage
    // );
    //Page1, and other pages
    if (this._data.page === 1 && this._data.allPage > 1) {
      return this._generateMarkupButtons(undefined, this._data.page + 1);
    }

    //Last page
    if (this._data.page === this._data.allPage && this._data.allPage > 1) {
      return this._generateMarkupButtons(this._data.page - 1, undefined);
    }

    //Other page
    if (this._data.page < this._data.allPage) {
      return this._generateMarkupButtons(
        this._data.page - 1,
        this._data.page + 1
      );
    }

    //Page1, and NO other page
    return '';
  }
  _generateMarkupButtons(prev, next) {
    const prevHidden = prev ? '' : 'hidden';
    const nextHidden = next ? '' : 'hidden';
    return `
    <button data-goto="${prev}" class="btn--inline pagination__btn--prev ${prevHidden}">
      <svg class="search__icon">
        <use href="${icons}#icon-arrow-left"></use>
      </svg>
      <span>Page ${prev ? prev : 0}</span>
    </button>
    <p class="all-page">${this._data.page} / ${this._data.allPage}</p>
    <button data-goto="${next}" class="btn--inline pagination__btn--next ${nextHidden}">
      <span>Page ${next ? next : 0}</span>
      <svg class="search__icon">
        <use href="${icons}.svg#icon-arrow-right"></use>
      </svg>
      </button> 
    `;

    // const prevBtn = `
    // <button data-goto="${prev}" class="btn--inline pagination__btn--prev">
    //         <svg class="search__icon">
    //           <use href="${icons}#icon-arrow-left"></use>
    //         </svg>
    //         <span>Page ${prev}</span>
    //       </button>
    // `;
    // const currentPage = `
    // <p>${this._data.page} / ${this._data.allPage}</p>
    // `;
    // const nextBtn = `
    // <button data-goto="${next}" class="btn--inline pagination__btn--next">
    //         <span>Page ${next}</span>
    //         <svg class="search__icon">
    //           <use href="${icons}.svg#icon-arrow-right"></use>
    //         </svg>
    //       </button>
    // `;

    // if (prev && next) return prevBtn + currentPage + nextBtn;
    // if (prev) return prevBtn + currentPage;
    // if (next) return currentPage + nextBtn;
  }
}

export default new PaginationsView();
