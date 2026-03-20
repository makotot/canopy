export default function Page() {
  return (
    <main>
      <form>
        <fieldset>
          <input type="text" />
          <input type="email" />
          <input type="tel" />
          <input type="url" />
          <input type="search" />
          <input type="number" />
          <input type="range" />
          <input type="checkbox" />
          <input type="radio" />
          <input type="button" />
          <input type="submit" />
          <input type="reset" />
          <input type="image" />
          <input />
          <textarea />
          <select>
            <optgroup label="Group">
              <option>Option</option>
            </optgroup>
          </select>
          <datalist>
            <option>Choice</option>
          </datalist>
          <button>Submit</button>
          <output>Result</output>
          <progress />
          <meter />
        </fieldset>
        <details>
          <summary>Toggle</summary>
        </details>
      </form>
    </main>
  );
}
