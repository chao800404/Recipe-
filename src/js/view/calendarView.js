import View from './view';
import flatpickr from 'flatpickr';

class CalendarView extends View {
  _parentElement = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _message = 'Ingredient was succesfully add calendar';

  _newWindow = document.querySelector('.nav__btn--open--calendar');
  constructor() {
    super();
    this._addHandlerHiddenWindow();
  }

  addHandlerRenderCalendar(handler) {
    window.addEventListener(
      'click',
      function (e) {
        const btn = e.target.closest('.btn--calendar');
        if (!btn) return;
        this._signGoogle(handler);
      }.bind(this)
    );
  }
  _signGoogle(handler) {
    const singnSatus = gapi.auth2.getAuthInstance().isSignedIn.get();
    if (!singnSatus) this._handleAuthClick();
    else {
      handler();
      this._flatpicker();
    }
  }
  _generateMarkup() {
    const currentDate = new Date();
    const date = currentDate.getDate();
    const year = currentDate.getFullYear();
    const mouth = currentDate.getMonth() + 1;
    const hours = currentDate.getHours().toString().padStart(2, 0);
    const minutes = currentDate.getMinutes().toString().padStart(2, 0);

    return `
            <button id="calendar--close" class ="btn--close-modal">×</button>
            <form class="calendarForm ">
                <h1>Add Recipe to Google Calendar</h1>
                <label for="title">Write your Title</label>
                <input name="title" request type="text" placeholder="Your Title or something..">
                <label for="content">Note your Content</label>
                <input name="content" request type="text"placeholder="Write your content or Note anything to there">
                <label for="date">Selected Date</label>
                <input name="date" required type="date" value="${year}-${mouth}-${date}">
                <label for="startTime">Start Time</label>
                <input name="startTime" required type="time" value="${hours}:${minutes}">
                <label for="endTiem">End Time</label>
                <input name="endTime" required type="time"value="${hours}:${minutes}">
                <div class="calendarSubmit"> 
                <button id="calendar--submit" class="btn--small" type="submit">submit</button>
                </div>
            </form>
    `;
  }

  toggleWindow() {
    this._parentElement.classList.toggle('hidden');
    this._overlay.classList.toggle('hidden');
  }
  addUploadCalendar(handler) {
    this._parentElement.addEventListener(
      'click',
      function (e) {
        e.preventDefault();
        const btn = e.target.closest('#calendar--submit');
        if (!btn) return;
        const form = this._parentElement.querySelector('form');
        const dataArr = [...new FormData(form)];
        const data = Object.fromEntries(dataArr);
        handler(data);
      }.bind(this)
    );
  }
  _flatpicker() {
    this._parentElement.querySelectorAll('input').forEach(item => {
      item.type === 'date' ? flatpickr(item, {}) : item;
      item.type === 'time'
        ? flatpickr(item, {
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true,
          })
        : item;
    });
  }
  _addHandlerHiddenWindow() {
    window.addEventListener('click', e => {
      const btn = e.target.closest('#calendar--close');
      if (!btn) return;
      this.toggleWindow();
    });
  }
  _handleAuthClick(isSignedIn) {
    if (isSignedIn) return;
    gapi.auth2.getAuthInstance().signIn();
  }
  newGoogleCalenderWindow() {
    this._newWindow.addEventListener('click', () => {
      window.open(
        'https://calendar.google.com/calendar/u/0/r',
        'Calendar',
        'heigth:800,width:800'
      );
    });
  }
}

export default new CalendarView();
