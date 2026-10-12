const { EditorSuggest, FuzzySuggestModal, ItemView, Menu, Modal, Notice, Platform, Plugin, PluginSettingTab, Setting, TFile, TFolder, setIcon, parseYaml, stringifyYaml } = require("obsidian");

const VIEW_TYPE = "rikka-binder";
const DEFAULT_DATA = { collapsed: {}, research: [], trash: [], collections: {}, templates: [], context: { section: "draft", folder: "" } };
const RIKKA_PROJECTS = [
  { id: "itl", name: "ITL", path: "ITL/ITL Obsidian" },
  { id: "cfi", name: "CFI", path: "CFI" },
  { id: "itl-links", name: "ITL Links", path: "ITL Links" }
];
const RIKKA_LABELS = { Rose: "#d77b91", Coral: "#e28a67", Amber: "#d2a13c", Sage: "#6d9c78", Teal: "#4f9b9a", Sky: "#4c83c3", Lavender: "#9270bd" };
const RIKKA_ICONS = ["file-text", "heart", "star", "bookmark", "tag", "lightbulb", "image", "message-circle", "pencil", "sparkles", "check", "flag"];
const RIKKA_ICON_DATA = {
  "BinderDraft@2x@2x.png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAAAlUlEQVRYCWNgGOmAESMAHDJ6MMRAAgdmHMQqTrrgZmQtTMicgWCz4LK0rHt6MbJcpwkqH1mOGDYjI6MfNnUDHgKjDhgNgdEQwFkOYMuzyGJnz55F5mKwjY2NMcSwCQx4FJAdAsT6EJuvkcWGbgiAfIErHZASOkM7BEjxKXK8I7MHPARGHTAaAqMhMBoCoz0j5GJ5ZLIBN1wTlhNJ5coAAAAASUVORK5CYII=",
  "BinderGroup@2x@2x.png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAABAUlEQVRYCWNgGAUjPQQYsQaAY7oXw39GJaCcAlZ5hOADBsb/9xj2z9yGECKNxYyhHGK5E1BcAEMOUwCohlGRQdGYheHB2duY0oRFWDCUQHzOcGtxY4SqjJg0hjySwO0nr56qxdavgIYWkgzxTCYsShVAYoQsR1MD1gMSIxUg0oBDlgQDw59gBgYmRVINIU39v/sMDCxrGQ5MewHShxQC9LAcbCXQgyC7IAApDUB8vmrO5GKYJC3osJTcXuRQRgoBWlhH2MxRB4yGwGgIjIbAaAiMhsBoCIyGAFKLCNRWY1KEtFgINyQoUwGyCwKQogDYUGRASMAUUJ+GNkqpb/AQNREAX1Awz0f/w2QAAAAASUVORK5CYII=",
  "BinderGroupWhite@2x@2x.png": "data:image/png;base64,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",
  "BinderResearch@2x@2x.png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAABwklEQVRYCWNgGOmAET0AQtUZFJkYGQqB4rrIchpCDLeQ+aSy/zMy3GFiYFjacJThGbJeoBgqwGY5qgryeIz/GVT+MTBEo+tmQRcA8sE+L87MdUCW0zE3RuEjyxHD7ixKmAVyBLpajBBAV0BrPrYQIMrObUcuEKUOpujUSwZ5KNsXJgaih24IwHwRXNwPY+KlgercoQrANCMjox+IP/RDAO7tEw1wJl6GBaq6AQ+BUQeQXQ7gi+evP/8xTN75muHVp98MWa6iDCri7DiVUz0KPv/4y9C1+SXDzec/GN5//cvQu/UVw63nP+njgI/f/jJ0bHrJ8OjtL7iFP37/Y+jd9pLh+tMfcDFkBtVCAOTbDqDPn73/jWw+mP3rz3+GCTteMVx5/B1DjmoO6Nj8guHFB0zLYTaCHDERmC7QAdUc8OrjH3SzMfh//v7HEKNaLpg/fz6G4cQIUC0EiLEMm5pRB1CcBtb2ghrQhMHc6RN2glRtv8swFVn1gEcB2SHgZWOA7BGC7MvrGB6CFAFDYDOy4kEZApeBLtTtnT75ALJLNVZS1jMCmQXqHSGbCWJjhMC//wygVibIEVQFsK4ZVQ0dFoYBAPQ9fDPtb7PsAAAAAElFTkSuQmCC",
  "BinderText@2x@2x.png": "data:image/png;base64,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",
  "BinderTrashEmpty@2x@2x.png": "data:image/png;base64,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",
  "BinderTrashFull@2x@2x.png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAABz0lEQVRYCWNkIB2wArWIAjE/EHMA8UcgvgfEZAEWInXBLBUGqgdhZAByCAiQ5QhCDmACGqwGxBIgG0BAVlaKrb0139TGysiBl4dbXFjCqgsoLAPEnEAMCo33QPwViIkChBwAthxkaUdrgZm1laGDtJS4JQsLMxfMdH9fJ52Nm/e9APKVgPgzVPwHkAY55i0Qv4KKYaUYsYoiBM2BTM6vH84s5uLiBPkSA2zZemDXX0ZpfQ4OjgdMTExHVq5ceW7u3LnPkBReA7JxOoKQAzSAmiWuX96Sq6GuGIRkKJz54f3ndxeufRfi5ORkMDcHuZeB4fv3788fPnx4QlNTcxKQ+xSIb4PEsQFcDgAlLFMgBqV2aoDXQENOAzEoWlAAMwoPwbEFMqllOchUbiAWAGKMnIIrEYItf/To0TKQbkqBnJxcFNAMrB4CZbMBBaMOICkE7t69ywDCMECID1OHj8aVCLHq+fbtG4o4IT6KYhwckkIAhxkUCY86YDQERkNgNARGQ4CkuoCLC94YBhe/hPjElNEkOUBZWRnFTEJ8FMU4OKNpYMBDAFe/wAUYZVhbsTiikhhhUN9gD7pCXP0CUJ8O1I4HteepAUCWnwbin+iGAQAAxGV0kXqebgAAAABJRU5ErkJggg=="
};

// Native Obsidian picker: type to filter, tap/Enter to choose (one step on mobile).
class RikkaChoiceModal extends FuzzySuggestModal {
  constructor(app, title, choices, onSubmit) {
    super(app);
    this.choices = choices;
    this.onSubmit = onSubmit;
    this.setPlaceholder(title);
  }

  getItems() { return this.choices; }
  getItemText(choice) { return choice.label; }

  onChooseItem(choice) {
    Promise.resolve(this.onSubmit(choice.value)).catch((error) => {
      console.error("Rikka action failed", error);
      new Notice(`Could not complete that action: ${error?.message || error}`);
    });
  }
}

class RikkaTextModal extends Modal {
  constructor(app, title, value, onSubmit) {
    super(app);
    this.title = title;
    this.value = value || "";
    this.onSubmit = onSubmit;
  }

  onOpen() {
    this.setTitle(this.title);
    new Setting(this.contentEl).setName("Synopsis").addTextArea((area) => {
      area.setValue(this.value).setPlaceholder("A short note to help identify this document.");
      area.inputEl.rows = 5;
      area.inputEl.style.width = "100%";
      area.onChange((value) => { this.value = value; });
    });
    new Setting(this.contentEl).addButton((button) => {
      button.setButtonText("Save").setCta().onClick(async () => {
        try {
          await this.onSubmit(this.value.trim());
          this.close();
        } catch (error) {
          console.error("Rikka action failed", error);
          new Notice(`Could not save synopsis: ${error?.message || error}`);
        }
      });
    });
  }
}

// All projects as a grid of cards. Names edit in place; each card can open,
// change folder, move left/right or be removed from Rikka (the folder stays).
class RikkaProjectsModal extends Modal {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
  }
  onOpen() {
    this.modalEl.addClass("rikka-projects-modal");
    this.setTitle("Projects");
    this.render();
  }
  countNotes(path) {
    const root = this.app.vault.getAbstractFileByPath(path);
    if (!(root instanceof TFolder)) return null;
    let n = 0;
    const walk = (folder) => { for (const c of folder.children) { if (c instanceof TFolder) walk(c); else if (c.extension === "md") n++; } };
    walk(root);
    return n;
  }
  render() {
    const { contentEl } = this;
    contentEl.empty();
    const grid = contentEl.createDiv({ cls: "rikka-projects-grid" });
    const plugin = this.plugin;
    const safe = (fn, label) => () => plugin.runSafely(async () => { await fn(); this.render(); }, label);
    plugin.projects.forEach((project, index) => {
      const active = project.id === plugin.data.activeProject;
      const card = grid.createDiv({ cls: `rikka-project-card${active ? " is-active" : ""}` });
      const name = card.createEl("input", { cls: "rikka-project-card-name", attr: { type: "text", value: project.name, "aria-label": "Project name", spellcheck: "false" } });
      const commit = async () => {
        const value = name.value.trim();
        if (!value || value === project.name) { name.value = project.name; return; }
        const result = await plugin.renameProject(project.id, value);
        if (typeof result === "string") { new Notice(`“${value}” is already used. Try “${result}”.`); name.value = project.name; }
      };
      name.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); name.blur(); }
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); name.value = project.name; name.blur(); }
      });
      name.addEventListener("blur", () => plugin.runSafely(commit, "Rename project"));
      const meta = card.createDiv({ cls: "rikka-project-card-meta" });
      const count = this.countNotes(project.path);
      meta.createDiv({ cls: "rikka-project-card-path", text: project.path });
      meta.createDiv({ text: count === null ? "Folder missing" : `${count} note${count === 1 ? "" : "s"}${active ? " · open now" : ""}` });
      const row = card.createDiv({ cls: "rikka-project-card-actions" });
      const btn = (icon, label, fn, disabled = false) => {
        const b = row.createEl("button", { cls: "clickable-icon", attr: { "aria-label": label, title: label } });
        setIcon(b, icon);
        b.disabled = disabled;
        b.addEventListener("click", fn);
        return b;
      };
      const open = row.createEl("button", { cls: active ? "" : "mod-cta", text: active ? "Open" : "Switch" });
      open.addEventListener("click", () => plugin.runSafely(async () => { await plugin.selectProject(project.id); this.close(); }, "Switch project"));
      btn("arrow-left", "Move left", safe(() => plugin.moveProject(project.id, -1), "Move project"), index === 0);
      btn("arrow-right", "Move right", safe(() => plugin.moveProject(project.id, 1), "Move project"), index === plugin.projects.length - 1);
      btn("folder-input", "Change folder…", () => {
        const folders = this.app.vault.getAllLoadedFiles().filter((f) => f instanceof TFolder && f.path !== "/").map((f) => ({ value: f.path, label: f.path }));
        new RikkaChoiceModal(this.app, `Folder for ${project.name}`, folders, async (path) => { await plugin.setProjectFolder(project.id, path); this.render(); }).open();
      });
      btn("x", "Remove from Rikka (folder and notes stay)", () => {
        new RikkaChoiceModal(this.app, `Remove “${project.name}” from Rikka? Its folder and notes are not touched.`, [
          { value: "yes", label: `Remove ${project.name} from the list` }, { value: "no", label: "Cancel" },
        ], async (v) => { if (v === "yes") { await plugin.removeProject(project.id); this.render(); } }).open();
      }, plugin.projects.length <= 1);
    });
    const add = grid.createEl("button", { cls: "rikka-project-card rikka-project-card-new" });
    setIcon(add.createSpan(), "plus");
    add.createSpan({ text: "New project" });
    add.addEventListener("click", () => { this.close(); plugin.promptNewProject(); });
  }
}

// Remembers meaningful text typed into a name dialog that was dismissed
// without creating anything, so an accidental swipe never loses it.
const RIKKA_NAME_DRAFTS = new Map();

class RikkaNameModal extends Modal {
  constructor(app, title, placeholder, onSubmit, options = {}, legacyInitial = "") {
    super(app);
    if (typeof options === "string") options = { buttonText: options, initialValue: legacyInitial };
    this.title = title;
    this.placeholder = placeholder;
    this.onSubmit = onSubmit;
    this.buttonText = options.buttonText || "Create";
    this.subtitle = options.subtitle || "";
    this.draftKey = options.draftKey || "";
    this.inputType = options.inputType || "text";
    this.value = options.initialValue || (this.draftKey && RIKKA_NAME_DRAFTS.get(this.draftKey)) || "";
    this.submitted = false;
  }

  onOpen() {
    this.modalEl.addClass("rikka-name-modal");
    this.setTitle(this.title);
    if (this.subtitle) this.contentEl.createDiv({ cls: "rikka-name-modal-path", text: this.subtitle });
    const form = this.contentEl.createEl("form", { cls: "rikka-name-modal-form" });
    this.inputEl = form.createEl("input", {
      cls: "rikka-name-modal-input",
      attr: { type: this.inputType, placeholder: this.placeholder, enterkeyhint: "done", autocapitalize: this.inputType === "url" ? "off" : "sentences", autocomplete: "off", spellcheck: "false" },
    });
    this.inputEl.value = this.value;
    this.inputEl.addEventListener("input", () => { this.value = this.inputEl.value; });
    const button = form.createEl("button", { cls: "mod-cta rikka-name-modal-button", text: this.buttonText, attr: { type: "submit" } });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      void this.submit();
    });
    this.buttonEl = button;
    this.noticeEl = this.contentEl.createDiv({ cls: "rikka-name-modal-notice" });
    this.setNotice = (text) => this.noticeEl.setText(text);
    window.setTimeout(() => { this.inputEl.focus(); this.inputEl.select(); }, 0);
  }

  async submit() {
    if (this.busy) return;
    const name = (this.value || "").trim();
    if (!name) return;
    this.busy = true;
    this.buttonEl?.setAttr("disabled", "true");
    try {
      const result = await this.onSubmit(name);
      if (result === false) { this.inputEl?.focus(); return; } // invalid: let them edit
      if (typeof result === "string") {
        // Name taken: propose the next free one ("Notes 2"); never overwrite.
        this.value = result;
        this.inputEl.value = result;
        this.inputEl.focus();
        this.inputEl.select();
        this.setNotice?.(`That name is taken — use “${result}”?`);
        return;
      }
      this.submitted = true;
      if (this.draftKey) RIKKA_NAME_DRAFTS.delete(this.draftKey);
      this.inputEl?.blur(); // dismiss the keyboard before the dialog closes
      this.close();
    } catch (error) {
      console.error("Rikka action failed", error);
      new Notice(`Could not complete that action: ${error?.message || error}`);
    } finally {
      this.busy = false;
      this.buttonEl?.removeAttribute("disabled");
    }
  }

  onClose() {
    this.inputEl?.blur();
    // Empty: nothing to keep. Meaningful unsaved text: keep it for next time.
    if (!this.submitted && this.draftKey) {
      const text = (this.value || "").trim();
      if (text) RIKKA_NAME_DRAFTS.set(this.draftKey, text); else RIKKA_NAME_DRAFTS.delete(this.draftKey);
    }
    this.contentEl.empty();
  }
}

class RikkaBinderView extends ItemView {
  constructor(leaf, plugin) {
    super(leaf);
    this.plugin = plugin;
    this.selectedPath = "";
  }

  getViewType() { return VIEW_TYPE; }
  getDisplayText() { return "Rikka"; }
  getIcon() { return "library"; }

  async onOpen() {
    this.containerEl.addClass("rikka-view-host");
    this.render();
  }

  async onClose() {
    this.containerEl.removeClass("rikka-view-host");
  }

  render() {
    const root = this.containerEl.children[1] || this.containerEl;
    const previousScroll = root.querySelector(".rikka-scroll")?.scrollTop ?? this.lastScrollTop ?? 0;
    root.empty();
    root.addClass("rikka-binder");
    try {
      const toolbar = root.createDiv({ cls: "rikka-toolbar" });
    const projectPicker = toolbar.createEl("select", { cls: "rikka-project-picker", attr: { "aria-label": "Active project" } });
    for (const project of this.plugin.projects) projectPicker.createEl("option", { value: project.id, text: project.name });
    projectPicker.createEl("option", { value: "__new_project__", text: "＋ New project…" });
    projectPicker.value = this.plugin.data.activeProject;
    projectPicker.addEventListener("change", () => {
      const choice = projectPicker.value;
      if (choice.startsWith("__")) projectPicker.value = this.plugin.data.activeProject;
      if (choice === "__new_project__") {
        this.plugin.promptNewProject();
      } else {
        this.plugin.runSafely(() => this.plugin.selectProject(projectPicker.value), "Switch project");
      }
    });
    // "+" always means "add here": both create buttons use the current location.
    const actions = toolbar.createDiv({ cls: "rikka-toolbar-actions" });
    if (!Platform.isMobile) this.makeToolbarButton(actions, "layout-grid", "All projects", () => new RikkaProjectsModal(this.plugin).open());
    this.makeToolbarButton(actions, "file-plus-2", "New document here", () => this.plugin.promptNewNote());
    this.makeToolbarButton(actions, "folder-plus", "New folder here", () => this.plugin.promptNewFolder());
    this.makeToolbarButton(actions, "more-horizontal", "More", (event) => this.plugin.showToolbarMore(event));

    // Location bar: where new things will go, plus the draft word count.
    const location = root.createDiv({ cls: "rikka-target rikka-location" });
    const place = location.createDiv({ cls: "rikka-location-place" });
    setIcon(place.createSpan({ cls: "rikka-location-icon" }), "map-pin");
    const where = this.plugin.contextInfo();
    place.createSpan({ cls: "rikka-location-path", text: where.path });
    place.setAttr("aria-label", `Current location: ${where.path}`);
    const wordCount = location.createDiv({ cls: "rikka-location-words" });
    void this.plugin.renderDraftWordCount(wordCount);

    const scroll = root.createDiv({ cls: "rikka-scroll" });
    const draftItems = this.plugin.getDraftItems();
    const draftEmpty = this.plugin.projectRoot instanceof TFolder
      ? "No documents yet. Right-click (or long-press) here to add one."
      : `Folder “${this.plugin.activeProject.path}” wasn’t found. It may have been renamed or moved.`;
    this.renderSection(scroll, "draft", "Draft", "folder", draftItems, draftEmpty);
    const researchItems = this.plugin.getCollectionItems("research");
    this.renderSection(scroll, "research", "Research", "library", researchItems, "Move a note here from its menu, or drag it into this section.");
    this.renderSavedCollections(scroll);
    const trashItems = this.plugin.getCollectionItems("trash");
    this.renderSection(scroll, "trash", "Trash", "trash-2", trashItems, "Items sent to Rikka Trash can be restored.");
    scroll.scrollTop = previousScroll;
    scroll.addEventListener("scroll", () => { this.lastScrollTop = scroll.scrollTop; }, { passive: true });
    } catch (error) {
      console.error("Rikka Binder render failed", error);
      root.createDiv({ cls: "rikka-error", text: `Rikka could not render the Binder: ${error?.message || error}` });
    }
  }

  renderUpdateButton() {
    const slot = this.updateSlot;
    if (!slot) return;
    slot.empty();
    const update = this.plugin.availableUpdate;
    if (!update) return;
    const button = slot.createEl("button", { cls: "rikka-update-button mod-cta", attr: { type: "button" } });
    setIcon(button.createSpan({ cls: "rikka-update-icon" }), "download");
    button.createSpan({ text: `Update Rikka to ${update.version}` });
    button.addEventListener("click", () => {
      button.setAttr("disabled", "true");
      button.lastChild.setText("Updating…");
      void this.plugin.installUpdate();
    }, { once: true });
  }

  updateContextHighlight() {
    const ctx = this.plugin.data.context;
    this.containerEl.querySelectorAll(".is-context").forEach((el) => el.removeClass("is-context"));
    if (ctx.folder) {
      this.containerEl.querySelectorAll(`.rikka-section[data-section] .rikka-folder-row`).forEach((row) => {
        const sectionEl = row.closest("[data-context-key]");
        if (row.dataset.path === ctx.folder && sectionEl?.dataset.contextKey === ctx.section) row.addClass("is-context");
      });
    } else {
      this.containerEl.querySelectorAll(`[data-context-section]`).forEach((el) => {
        if (el.dataset.contextSection === ctx.section) el.addClass("is-context");
      });
    }
    const label = this.containerEl.querySelector(".rikka-location-path");
    if (label) label.setText(this.plugin.contextInfo().path);
  }

  // Move the selection highlight without rebuilding the Binder.
  setSelected(path) {
    this.selectedPath = path;
    this.containerEl.querySelectorAll(".rikka-row.is-selected").forEach((row) => row.removeClass("is-selected"));
    this.containerEl.querySelectorAll(".rikka-row").forEach((row) => {
      if (row.dataset.path === path) row.addClass("is-selected");
    });
  }

  makeToolbarButton(parent, icon, label, callback) {
    const button = parent.createEl("button", { cls: "rikka-icon-button", attr: { "aria-label": label, title: label } });
    setIcon(button, icon);
    button.addEventListener("click", (event) => this.plugin.runSafely(() => callback(event), label));
  }

  appendBinderImage(parent, name) {
    const iconPath = `${this.plugin.app.vault.configDir}/plugins/rikka/assets/${name}`;
    parent.createEl("img", {
      cls: "rikka-scrivener-icon",
      attr: {
        src: RIKKA_ICON_DATA[name] || this.plugin.app.vault.adapter.getResourcePath(iconPath),
        alt: "",
        "aria-hidden": "true",
      },
    });
  }

  renderSection(parent, key, label, icon, items, emptyText) {
    const section = parent.createDiv({ cls: "rikka-section" });
    section.dataset.section = key;
    section.dataset.contextKey = key;
    section.addEventListener("dragover", (event) => { event.preventDefault(); section.addClass("rikka-drop-target"); });
    section.addEventListener("dragleave", () => section.removeClass("rikka-drop-target"));
    section.addEventListener("drop", (event) => {
      event.preventDefault();
      section.removeClass("rikka-drop-target");
      const path = event.dataTransfer?.getData("text/plain");
      if (!path) return;
      this.plugin.runSafely(async () => {
        await this.plugin.moveToCollection(path, key === "research" ? "research" : key === "trash" ? "trash" : "draft");
        // Dropping on the Draft section (not on a folder) moves the item to the project root.
        if (key === "draft") {
          const root = this.plugin.app.vault.getAbstractFileByPath(this.plugin.activeProject.path);
          if (root instanceof TFolder) await this.plugin.moveIntoFolder(path, root);
        }
      }, "Move document");
    });
    section.addEventListener("contextmenu", (event) => {
      if (key === "trash") return;
      event.preventDefault();
      const menu = new Menu();
      menu.addItem((entry) => entry.setTitle(`New document in ${label}`).setIcon("file-plus-2").onClick(() => this.plugin.promptNewNote({ section: key, folder: "" })));
      menu.addItem((entry) => entry.setTitle(`New folder in ${label}`).setIcon("folder-plus").onClick(() => this.plugin.promptNewFolder({ section: key, folder: "" })));
      menu.showAtMouseEvent(event);
    });

    const collapsed = Boolean(this.plugin.data.collapsed[`section:${key}`]);
    const heading = section.createDiv({ cls: "rikka-section-heading" });
    const toggle = heading.createEl("button", { cls: "rikka-disclosure", attr: { "aria-label": collapsed ? `Expand ${label}` : `Collapse ${label}` } });
    setIcon(toggle, collapsed ? "chevron-right" : "chevron-down");
    const glyph = heading.createSpan({ cls: "rikka-section-icon" });
    const binderIcon = key === "draft" ? "BinderDraft@2x@2x.png"
      : key === "research" ? "BinderResearch@2x@2x.png"
      : key === "trash" ? `${items.length ? "BinderTrashFull" : "BinderTrashEmpty"}@2x@2x.png`
      : null;
    if (binderIcon) {
      this.appendBinderImage(glyph, binderIcon);
    } else {
      setIcon(glyph, icon);
    }
    heading.createSpan({ cls: "rikka-section-label", text: label });
    heading.createSpan({ cls: "rikka-section-count", text: String(items.length) });
    const ctx = this.plugin.data.context;
    if (key !== "trash" && ctx.section === key && !ctx.folder) heading.addClass("is-context");
    heading.dataset.contextSection = key;
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      this.plugin.toggleCollapsed(`section:${key}`);
    });
    // Tap the heading (not the arrow) to work at the top level of this section.
    if (key !== "trash") heading.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      this.plugin.setContext(key, "", { expandSection: true });
    });

    if (collapsed) return;
    const body = section.createDiv({ cls: "rikka-section-body" });
    if (!items.length) {
      body.createDiv({ cls: "rikka-empty", text: emptyText });
      return;
    }
    for (const item of items) this.renderNode(body, item, 0, key);
  }

  renderSavedCollections(parent) {
    const entries = Object.entries(this.plugin.data.collections || {}).sort(([a], [b]) => a.localeCompare(b));
    const section = parent.createDiv({ cls: "rikka-section rikka-collections" });
    section.dataset.section = "collections";
    const heading = section.createDiv({ cls: "rikka-section-heading" });
    const glyph = heading.createSpan({ cls: "rikka-section-icon" });
    setIcon(glyph, "library");
    heading.createSpan({ cls: "rikka-section-label", text: "Collections" });
    heading.createSpan({ cls: "rikka-section-count", text: String(entries.length) });
    if (!entries.length) {
      section.createDiv({ cls: "rikka-empty", text: "Saved groups of notes appear here." });
      return;
    }
    for (const [name, paths] of entries) {
      const group = section.createDiv({ cls: "rikka-custom-collection" });
      group.dataset.contextKey = `collection:${name}`;
      const groupHeading = group.createDiv({ cls: "rikka-collection-heading" });
      groupHeading.dataset.contextSection = `collection:${name}`;
      const files = paths.map((path) => this.plugin.app.vault.getAbstractFileByPath(path)).filter((file) => file instanceof TFile);
      const key = `collection:${name}`;
      const collapsed = Boolean(this.plugin.data.collapsed[key]);
      const toggle = groupHeading.createEl("button", { cls: "rikka-disclosure", attr: { "aria-label": collapsed ? `Expand ${name}` : `Collapse ${name}` } });
      setIcon(toggle, collapsed ? "chevron-right" : "chevron-down");
      groupHeading.createSpan({ cls: "rikka-collection-name", text: name });
      groupHeading.createSpan({ cls: "rikka-section-count", text: String(files.length) });
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
      this.plugin.runSafely(() => this.plugin.toggleCollapsed(key), `Toggle ${name}`);
      });
      groupHeading.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        this.plugin.showCollectionMenu(name, event);
      });
      const ctx = this.plugin.data.context;
      if (ctx.section === key && !ctx.folder) groupHeading.addClass("is-context");
      groupHeading.addEventListener("click", (event) => {
        if (event.target.closest("button")) return;
        this.plugin.setContext(key, "", { expandSection: true });
      });
      if (collapsed) continue;
      const body = group.createDiv({ cls: "rikka-collection-body" });
      for (const file of files) this.renderNode(body, file, 0, key);
    }
  }

  renderNode(parent, item, depth, sectionKey) {
    const isFolder = item instanceof TFolder;
    const isFile = item instanceof TFile;
    if (!isFolder && !isFile) return;
    const row = parent.createDiv({ cls: `rikka-row${this.selectedPath === item.path ? " is-selected" : ""}` });
    row.addClass(isFolder ? "rikka-folder-row" : "rikka-note-row");
    if (isFile && item.extension === "base") row.addClass("rikka-base-row");
    if (isFile && item.extension === "canvas") row.addClass("rikka-canvas-row");
    row.style.setProperty("--rikka-depth", String(depth));
    row.dataset.path = item.path;
    // Drag to move on desktop; on touch, long-press → Move… is the reliable way.
    row.draggable = !Platform.isMobile;
    row.addEventListener("dragstart", (event) => {
      // Register the drag with Obsidian's own drag manager so the item can also
      // be dropped on the core File explorer / editor like a native file drag.
      try {
        const manager = this.plugin.app.dragManager;
        const data = isFile ? manager?.dragFile?.(event, item) : manager?.dragFolder?.(event, item);
        if (data) manager.onDragStart(event, data);
      } catch (error) {
        console.debug("Rikka: native drag hand-off unavailable", error);
      }
      event.dataTransfer?.setData("text/plain", item.path);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "all";
    });
    row.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.plugin.showItemMenu(item, sectionKey, event);
    });

    if (isFolder && sectionKey === "draft") {
      // Drop a document or folder onto this folder to move it inside.
      row.addEventListener("dragover", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
        row.addClass("rikka-drop-target");
      });
      row.addEventListener("dragleave", () => row.removeClass("rikka-drop-target"));
      row.addEventListener("drop", (event) => {
        event.preventDefault();
        event.stopPropagation();
        row.removeClass("rikka-drop-target");
        const path = event.dataTransfer?.getData("text/plain");
        if (path) this.plugin.runSafely(() => this.plugin.moveIntoFolder(path, item), "Move into folder");
      });
    }

    if (isFolder) {
      const folderKey = `folder:${sectionKey}:${item.path}`;
      const collapsed = this.plugin.data.collapsed[folderKey] ?? true;
      const disclosure = row.createEl("button", { cls: "rikka-disclosure rikka-row-disclosure", attr: { "aria-label": collapsed ? "Expand folder" : "Collapse folder" } });
      setIcon(disclosure, collapsed ? "chevron-right" : "chevron-down");
      disclosure.addEventListener("click", (event) => {
        event.stopPropagation();
        this.plugin.toggleCollapsed(`folder:${sectionKey}:${item.path}`);
      });
      const icon = row.createSpan({ cls: "rikka-row-icon" });
      const folderIcon = this.selectedPath === item.path ? "BinderGroupWhite@2x@2x.png" : "BinderGroup@2x@2x.png";
      this.appendBinderImage(icon, folderIcon);
      row.createSpan({ cls: "rikka-row-title", text: item.name });
      const ctx = this.plugin.data.context;
      if (ctx.section === sectionKey && ctx.folder === item.path) row.addClass("is-context");
      row.addEventListener("click", (event) => {
        if (event.target.closest("button")) return;
        // Opening a folder makes it the current location and shows its contents.
        // It never collapses it; the arrow is the only expand/collapse control.
        this.plugin.setContext(sectionKey, item.path, { expandFolder: true });
      });

      if (!collapsed) {
        const children = parent.createDiv({ cls: "rikka-children" });
        children.style.setProperty("--rikka-depth", String(depth + 1));
        const visibleChildren = this.plugin.getVisibleChildren(item, sectionKey);
        for (const child of visibleChildren) this.renderNode(children, child, depth + 1, sectionKey);
        if (!visibleChildren.length && sectionKey !== "trash") {
          const empty = children.createDiv({ cls: "rikka-empty rikka-folder-empty" });
          empty.style.setProperty("--rikka-depth", String(depth + 1));
          empty.createSpan({ text: "No documents yet · " });
          const add = empty.createEl("button", { cls: "rikka-link-button", text: "New document", attr: { type: "button" } });
          add.addEventListener("click", (event) => {
            event.stopPropagation();
            this.plugin.promptNewNote({ section: sectionKey, folder: item.path });
          });
        }
      }
      return;
    }

    const spacer = row.createSpan({ cls: "rikka-disclosure rikka-disclosure-spacer" });
    spacer.setAttr("aria-hidden", "true");
    const icon = row.createSpan({ cls: "rikka-row-icon" });
    const fileIcon = this.plugin.iconForFile(item);
    if (item.extension === "md" && fileIcon === "file-text") {
      this.appendBinderImage(icon, "BinderText@2x@2x.png");
    } else {
      setIcon(icon, fileIcon);
    }
    row.createSpan({ cls: "rikka-row-title", text: item.basename });
    const frontmatter = this.plugin.app.metadataCache.getFileCache(item)?.frontmatter || {};
    if (frontmatter.rikka_synopsis) row.setAttr("title", String(frontmatter.rikka_synopsis));
    const labelColor = RIKKA_LABELS[frontmatter.rikka_label];
    if (labelColor) {
      row.style.setProperty("--rikka-label-color", labelColor);
      row.addClass("has-rikka-label");
    }
    if (frontmatter.rikka_status) row.createSpan({ cls: "rikka-row-status", text: frontmatter.rikka_status });
    const cachedWords = this.plugin.wordCountCache.get(item.path)?.words;
    if (Number.isFinite(cachedWords)) row.createSpan({ cls: "rikka-row-wordcount", text: `${cachedWords.toLocaleString()}w` });
    row.addEventListener("click", (event) => {
      this.setSelected(item.path);
      this.plugin.setContextFromItem(item, sectionKey);
      const openInNewTab = !Platform.isMobile && (event.metaKey || event.ctrlKey);
      this.plugin.runSafely(() => this.plugin.openFile(item, openInNewTab), "Open document");
    });
    row.addEventListener("dblclick", (event) => event.preventDefault());
  }
}

// ===========================================================================
// Editor: "/" and "@" menus and block-style actions, built on Obsidian's
// EditorSuggest so they position near the caret, stay above the iPhone
// keyboard and support arrow keys / Enter / Escape natively.
// Every edit is one editor.transaction() => one undo step, plain Markdown.
// ===========================================================================

// Is the caret somewhere a command menu would be unwelcome?
// (fenced code, frontmatter, inline code, math)
function rikkaInCodeContext(editor, line, ch) {
  let fenced = false;
  let inFrontmatter = false;
  for (let i = 0; i < line; i++) {
    const text = editor.getLine(i);
    if (i === 0 && /^---\s*$/.test(text)) { inFrontmatter = true; continue; }
    if (inFrontmatter) { if (/^---\s*$/.test(text)) inFrontmatter = false; continue; }
    if (/^\s*(```|~~~)/.test(text)) fenced = !fenced;
  }
  if (fenced || inFrontmatter) return true;
  const before = editor.getLine(line).slice(0, ch);
  if ((before.match(/`/g) || []).length % 2 === 1) return true;
  if ((before.match(/(?<!\\)\$/g) || []).length % 2 === 1) return true;
  return false;
}

// Line prefixes we treat as "block markers" (indent, list, task, quote, heading).
const RIKKA_PREFIX_RE = /^(\s*)(?:(?:[-*+]|\d+[.)])\s+(?:\[[ xX]\]\s+)?|>\s?|#{1,6}\s+)?/;

function rikkaFuzzy(query, text) {
  if (!query) return 1;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (t.startsWith(q)) return 3;
  if (t.split(/[\s-]+/).some((word) => word.startsWith(q))) return 2.5;
  if (t.includes(q)) return 2;
  let i = 0;
  for (const c of t) if (c === q[i]) i++;
  return i === q.length ? 1 : 0;
}

class RikkaSlashSuggest extends EditorSuggest {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
    this.limit = 40;
    this.setInstructions?.([
      { command: "↑↓", purpose: "to navigate" },
      { command: "↵", purpose: "to insert" },
      { command: "esc", purpose: "to dismiss" },
    ]);
  }

  onTrigger(cursor, editor) {
    const before = editor.getLine(cursor.line).slice(0, cursor.ch);
    // "/" must start a block (after indent/list/quote markers) or follow a space,
    // so URLs (https://a/b), paths (src/x) and fractions (1/2) never trigger it.
    const match = before.match(/(^|\s)\/([\p{L}\p{N}#]*)$/u);
    if (!match) return null;
    if (match[2].length > 24) return null;
    const start = cursor.ch - match[2].length - 1;
    if (rikkaInCodeContext(editor, cursor.line, start)) return null;
    return { start: { line: cursor.line, ch: start }, end: cursor, query: match[2] };
  }

  getSuggestions(context) {
    const query = context.query.trim();
    const items = this.plugin.slashCommands();
    if (!query) return items;
    return items
      .map((item) => {
        const score = Math.max(
          rikkaFuzzy(query, item.title) * 2,
          ...item.aliases.map((alias) => rikkaFuzzy(query, alias) * 1.8),
          rikkaFuzzy(query, item.description) * 0.5,
        );
        return { item, score };
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item);
  }

  renderSuggestion(item, el) {
    el.addClass("rikka-slash-item");
    if (item.firstInGroup && !this.context?.query) el.createDiv({ cls: "rikka-slash-group", text: item.group });
    const row = el.createDiv({ cls: "rikka-slash-row" });
    const icon = row.createDiv({ cls: "rikka-slash-icon" });
    setIcon(icon, item.icon);
    const text = row.createDiv({ cls: "rikka-slash-text" });
    text.createDiv({ cls: "rikka-slash-title", text: item.title });
    text.createDiv({ cls: "rikka-slash-desc", text: item.description });
  }

  selectSuggestion(item) {
    const context = this.context;
    if (!context) return;
    const { editor, start, end, file } = context;
    this.close();
    // The typed "/query" is removed in the same transaction as the command's
    // own change wherever possible, so one Undo restores the line.
    Promise.resolve(item.run({ editor, from: start, to: end, file })).catch((error) => {
      console.error("Rikka slash command failed", error);
      new Notice(`${item.title} failed: ${error?.message || error}`);
    });
  }
}

class RikkaMentionSuggest extends EditorSuggest {
  constructor(plugin) {
    super(plugin.app);
    this.plugin = plugin;
    this.limit = 30;
  }

  onTrigger(cursor, editor) {
    const before = editor.getLine(cursor.line).slice(0, cursor.ch);
    // "@" after a space or at line start (never inside emails like a@b.com).
    const match = before.match(/(^|\s)@([^\s@\[\]]{0,40})$/u);
    if (!match) return null;
    const start = cursor.ch - match[2].length - 1;
    if (rikkaInCodeContext(editor, cursor.line, start)) return null;
    return { start: { line: cursor.line, ch: start }, end: cursor, query: match[2] };
  }

  getSuggestions(context) {
    const query = context.query.toLowerCase();
    const m = window.moment;
    const dates = [
      { kind: "date", title: "Today", date: m(), aliases: ["today", "now", "date"] },
      { kind: "date", title: "Tomorrow", date: m().add(1, "day"), aliases: ["tomorrow"] },
      { kind: "date", title: "Yesterday", date: m().subtract(1, "day"), aliases: ["yesterday"] },
    ];
    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    for (const [i, day] of weekdays.entries()) {
      if (query.length >= 2 && day.startsWith(query)) {
        const target = m().isoWeekday(i + 1);
        if (target.isSameOrBefore(m(), "day")) target.add(1, "week");
        dates.push({ kind: "date", title: `Next ${day[0].toUpperCase()}${day.slice(1)}`, date: target, aliases: [day] });
      }
    }
    const dateHits = dates.filter((d) => !query || d.aliases.some((a) => a.startsWith(query)) || d.title.toLowerCase().includes(query));
    // Notes: Obsidian's in-memory file list (no disk reads, cheap per keystroke).
    const notes = [];
    if (query) {
      for (const file of this.app.vault.getMarkdownFiles()) {
        const score = rikkaFuzzy(query, file.basename);
        if (score >= 2) notes.push({ kind: "note", title: file.basename, file, score, path: file.parent?.path || "" });
        if (notes.length > 200) break;
      }
      notes.sort((a, b) => b.score - a.score || a.title.length - b.title.length);
    }
    return [...dateHits, ...notes.slice(0, 20)];
  }

  renderSuggestion(item, el) {
    el.addClass("rikka-slash-item");
    const row = el.createDiv({ cls: "rikka-slash-row" });
    setIcon(row.createDiv({ cls: "rikka-slash-icon" }), item.kind === "date" ? "calendar" : "file-text");
    const text = row.createDiv({ cls: "rikka-slash-text" });
    text.createDiv({ cls: "rikka-slash-title", text: item.title });
    text.createDiv({ cls: "rikka-slash-desc", text: item.kind === "date" ? item.date.format("dddd, D MMMM YYYY") : (item.path === "/" ? "" : item.path) });
  }

  selectSuggestion(item) {
    const context = this.context;
    if (!context) return;
    const { editor, start, end, file } = context;
    this.close();
    const text = item.kind === "date"
      ? item.date.format("YYYY-MM-DD")
      : this.app.fileManager.generateMarkdownLink(item.file, file?.path || "");
    editor.transaction({ changes: [{ from: start, to: end, text }], selection: { from: { line: start.line, ch: start.ch + text.length } } });
  }
}

// ===========================================================================
// Rikka QA: automated desktop + mobile-emulation regression suite.
// Commands: "Rikka QA: run desktop tests", "...mobile tests", "...all tests".
// Mobile runs use Obsidian's own app.emulateMobile(true) (which reloads the
// app), resume after reload, then restore desktop mode. Everything happens in
// a throwaway "_Rikka QA" folder that is moved to the system trash at the end.
// ===========================================================================

const RIKKA_QA_KEY = "rikka-qa-state";

class RikkaQAReportModal extends Modal {
  constructor(app, results) {
    super(app);
    this.results = results;
  }
  onOpen() {
    this.modalEl.addClass("rikka-qa-report");
    const all = Object.values(this.results).flat();
    const failed = all.filter((r) => !r.ok);
    this.setTitle(`Rikka QA — ${all.length - failed.length}/${all.length} passed`);
    for (const [suite, rows] of Object.entries(this.results)) {
      this.contentEl.createEl("h4", { text: suite });
      const list = this.contentEl.createEl("ul");
      for (const r of rows) {
        const li = list.createEl("li", { cls: r.ok ? "rikka-qa-pass" : "rikka-qa-fail" });
        li.setText(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
      }
    }
  }
}

class RikkaQA {
  constructor(plugin) {
    this.plugin = plugin;
    this.app = plugin.app;
    this.rows = [];
  }

  wait(ms) { return new Promise((r) => window.setTimeout(r, ms)); }
  async waitFor(fn, timeout = 4000, step = 50) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try { const v = await fn(); if (v) return v; } catch (e) { /* retry */ }
      await this.wait(step);
    }
    return null;
  }
  check(name, ok, detail = "") {
    this.rows.push({ name, ok: Boolean(ok), detail: ok ? "" : String(detail || "") });
    console[ok ? "log" : "warn"](`[Rikka QA] ${ok ? "PASS" : "FAIL"} ${name}${ok ? "" : ` — ${detail}`}`);
  }
  async step(name, fn) {
    try { await fn(); } catch (error) { this.check(name, false, error?.message || error); }
  }
  file(path) { return this.app.vault.getAbstractFileByPath(path); }
  view() { return this.plugin.getView(); }
  q(sel, root = document) { return root.querySelector(sel); }
  tap(el) {
    // A touch-like tap: pointer + touch + click, as one user action produces.
    const r = el.getBoundingClientRect();
    const opts = { bubbles: true, cancelable: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    el.dispatchEvent(new PointerEvent("pointerdown", { ...opts, pointerType: "touch" }));
    el.dispatchEvent(new PointerEvent("pointerup", { ...opts, pointerType: "touch" }));
    el.dispatchEvent(new MouseEvent("click", opts));
  }
  async submitName(name) {
    const input = await this.waitFor(() => this.q(".rikka-name-modal-input"));
    if (!input) throw new Error("name dialog did not open");
    const title = this.q(".rikka-name-modal .modal-title")?.textContent || "";
    input.value = name;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.closest("form").requestSubmit();
    await this.waitFor(() => !this.q(".rikka-name-modal"), 3000);
    return title;
  }

  // ---- fixture ------------------------------------------------------------
  async setup(mode) {
    const root = this.plugin.activeProject.path;
    this.sandbox = `${root}/_Rikka QA ${mode}`;
    // Clear leftovers from any earlier run (either mode).
    for (const old of [`${root}/_Rikka QA desktop`, `${root}/_Rikka QA mobile`]) {
      if (this.file(old)) await this.app.fileManager.trashFile(this.file(old));
    }
    await this.app.vault.createFolder(this.sandbox);
    await this.plugin.activateView();
    await this.waitFor(() => this.view()?.containerEl.querySelector(".rikka-section"));
  }
  async teardown() {
    // Save and close every tab showing a test file, then let pending saves
    // finish, so nothing recreates the sandbox after it is trashed.
    const isTest = (path) => path.startsWith(this.sandbox) || path.endsWith("/Mobile Context Test.md");
    for (const leaf of this.app.workspace.getLeavesOfType("bases").concat(this.app.workspace.getLeavesOfType("markdown"))) {
      const path = leaf.view?.file?.path || "";
      if (!isTest(path)) continue;
      try { await leaf.view?.save?.(); } catch (error) { /* ignore */ }
      leaf.detach();
    }
    await this.wait(2500);
    const research = (p) => p.startsWith(this.sandbox) || p.includes("Mobile Context Test");
    this.plugin.data.research = this.plugin.data.research.filter((p) => !research(p));
    const stray = this.file(`${this.plugin.activeProject.path}/Mobile Context Test.md`);
    if (stray) await this.app.fileManager.trashFile(stray);
    if (this.file(this.sandbox)) await this.app.fileManager.trashFile(this.file(this.sandbox));
    await this.wait(2500);
    if (this.file(this.sandbox)) await this.app.fileManager.trashFile(this.file(this.sandbox)); // late save safety net
    this.plugin.data.context = { section: "draft", folder: "" };
    await this.plugin.saveState();
  }

  // ---- suites -------------------------------------------------------------
  async run(mode) {
    const isMobile = Platform.isMobile;
    this.check(`Obsidian reports ${mode} mode`, mode === "mobile" ? isMobile : !isMobile, `Platform.isMobile=${isMobile}`);
    await this.setup(mode);
    try {
      await this.contextFlows(mode);
      await this.fileFlows(mode);
      await this.boardFlows(mode);
      await this.editorFlows(mode);
      await this.kanbanAudit(mode);
      if (mode === "mobile") await this.layoutChecks();
    } finally {
      await this.teardown();
    }
    return this.rows;
  }

  async contextFlows(mode) {
    const v = this.view();
    const root = this.plugin.activeProject.path;
    await this.step("Research: tap makes it current, New document says 'in Research', file lands in Research", async () => {
      const heading = await this.waitFor(() => v.containerEl.querySelector('[data-context-section="research"]'));
      this.tap(heading);
      await this.waitFor(() => this.plugin.data.context.section === "research");
      await this.waitFor(() => v.containerEl.querySelector('[data-context-section="research"].is-context'));
      this.check("Research heading shows active state", v.containerEl.querySelector('[data-context-section="research"].is-context'), "no .is-context");
      this.tap(v.containerEl.querySelector('[aria-label="New document here"]'));
      const title = await this.submitName("Mobile Context Test");
      this.check("Dialog title is 'New document in Research'", title === "New document in Research", title);
      const path = `${root}/Mobile Context Test.md`;
      await this.waitFor(() => this.file(path));
      this.check("File created and registered in Research", this.file(path) && this.plugin.data.research.includes(path), path);
      this.check("Research is still the current location", this.plugin.data.context.section === "research" && !this.plugin.data.context.folder, JSON.stringify(this.plugin.data.context));
    });

    await this.step("Nested folder: New folder in X, open it, New document lands inside", async () => {
      this.plugin.setContext("draft", this.sandbox, { expandFolder: true });
      await this.waitFor(() => v.containerEl.querySelector(`.rikka-row[data-path="${CSS.escape(this.sandbox)}"]`));
      this.tap(v.containerEl.querySelector('[aria-label="New folder here"]'));
      const ftitle = await this.submitName("Competitors");
      this.check("Folder dialog names the current folder", ftitle === `New folder in _Rikka QA ${mode}`, ftitle);
      const folder = `${this.sandbox}/Competitors`;
      await this.waitFor(() => this.file(folder));
      this.check("Folder created inside the current folder", this.file(folder) instanceof TFolder, folder);
      const row = await this.waitFor(() => v.containerEl.querySelector(`.rikka-folder-row[data-path="${CSS.escape(folder)}"]`));
      this.tap(row.querySelector(".rikka-row-title"));
      await this.waitFor(() => this.plugin.data.context.folder === folder);
      this.check("Tapping folder name makes it current", this.plugin.data.context.folder === folder, JSON.stringify(this.plugin.data.context));
      await this.waitFor(() => (v.containerEl.querySelector(".rikka-location-path")?.textContent || "").endsWith("/ Competitors"), 1500);
      this.check("Location bar shows nested path", (v.containerEl.querySelector(".rikka-location-path")?.textContent || "").endsWith("/ Competitors"), v.containerEl.querySelector(".rikka-location-path")?.textContent);
      this.tap(v.containerEl.querySelector('[aria-label="New document here"]'));
      const dtitle = await this.submitName("Pricing");
      this.check("Doc dialog says 'New document in Competitors'", dtitle === "New document in Competitors", dtitle);
      await this.waitFor(() => this.file(`${folder}/Pricing.md`));
      this.check("Document created in Competitors", this.file(`${folder}/Pricing.md`), `${folder}/Pricing.md`);
      this.check("Nothing created at project root", !this.file(`${root}/Pricing.md`));
    });

    await this.step("Chevron toggles without changing location", async () => {
      const folder = `${this.sandbox}/Competitors`;
      const row = v.containerEl.querySelector(`.rikka-folder-row[data-path="${CSS.escape(folder)}"]`);
      const before = JSON.stringify(this.plugin.data.context);
      this.tap(row.querySelector(".rikka-row-disclosure"));
      await this.wait(250);
      this.check("Arrow collapses folder", this.plugin.data.collapsed[`folder:draft:${folder}`] === true);
      this.check("Arrow does not change location", JSON.stringify(this.plugin.data.context) === before);
      this.tap(v.containerEl.querySelector(`.rikka-folder-row[data-path="${CSS.escape(folder)}"] .rikka-row-disclosure`));
      await this.wait(250);
    });

    await this.step("Duplicate name proposes the next free name", async () => {
      this.tap(v.containerEl.querySelector('[aria-label="New document here"]'));
      const input = await this.waitFor(() => this.q(".rikka-name-modal-input"));
      input.value = "Pricing"; input.dispatchEvent(new Event("input", { bubbles: true }));
      input.closest("form").requestSubmit();
      await this.waitFor(() => this.q(".rikka-name-modal-input")?.value === "Pricing 2");
      this.check("Proposes 'Pricing 2' and keeps dialog open", this.q(".rikka-name-modal-input")?.value === "Pricing 2", this.q(".rikka-name-modal-input")?.value);
      this.q(".rikka-name-modal .modal-close-button")?.click();
      await this.wait(200);
    });
  }

  async fileFlows(mode) {
    const folder = `${this.sandbox}/Competitors`;
    await this.step("Rename current folder keeps it current and expanded", async () => {
      await this.app.fileManager.renameFile(this.file(folder), `${this.sandbox}/Rivals`);
      await this.waitFor(() => this.plugin.data.context.folder === `${this.sandbox}/Rivals`);
      this.check("Context follows rename", this.plugin.data.context.folder === `${this.sandbox}/Rivals`, this.plugin.data.context.folder);
      this.check("Expanded state follows rename", this.plugin.data.collapsed[`folder:draft:${this.sandbox}/Rivals`] === false);
      this.check("Only the folder was renamed (child intact)", this.file(`${this.sandbox}/Rivals/Pricing.md`) && !this.file(`${this.sandbox}/Competitors`));
    });
    await this.step("Rename a document renames only that document", async () => {
      await this.app.vault.create(`${this.sandbox}/Alpha.md`, "a");
      await this.app.vault.create(`${this.sandbox}/Beta.md`, "b");
      await this.app.fileManager.renameFile(this.file(`${this.sandbox}/Alpha.md`), `${this.sandbox}/Alpha renamed.md`);
      await this.wait(300);
      const names = this.file(this.sandbox).children.map((c) => c.name).sort();
      this.check("Sibling untouched after rename", names.includes("Beta.md") && names.includes("Alpha renamed.md") && !names.includes("Alpha.md"), names.join(", "));
      this.check("Contents untouched after rename", (await this.app.vault.read(this.file(`${this.sandbox}/Beta.md`))) === "b");
    });
    if (mode !== "mobile") await this.step("Opening from Binder uses the current tab, not the first", async () => {
      const ws = this.app.workspace;
      const tabA = ws.getLeaf("tab");
      await tabA.openFile(this.file(`${this.sandbox}/Alpha renamed.md`), { active: true });
      const tabB = ws.getLeaf("tab");
      ws.setActiveLeaf(tabB, { focus: true });
      await this.wait(200);
      await this.plugin.openFile(this.file(`${this.sandbox}/Beta.md`));
      await this.wait(300);
      this.check("Document opens in the tab you're in", tabB.view?.file?.path === `${this.sandbox}/Beta.md`, tabB.view?.file?.path);
      this.check("Other tab keeps its document", tabA.view?.file?.path === `${this.sandbox}/Alpha renamed.md`, tabA.view?.file?.path);
      tabA.detach(); tabB.detach();
    });
    await this.step("Move, duplicate, delete-current-folder fallback", async () => {
      await this.plugin.moveIntoFolder(`${this.sandbox}/Beta.md`, this.file(`${this.sandbox}/Rivals`));
      this.check("Move puts the real file in the folder", this.file(`${this.sandbox}/Rivals/Beta.md`) && !this.file(`${this.sandbox}/Beta.md`));
      await this.plugin.duplicateFile(this.file(`${this.sandbox}/Rivals/Beta.md`));
      this.check("Duplicate creates 'Beta copy'", this.file(`${this.sandbox}/Rivals/Beta copy.md`));
      await this.app.fileManager.trashFile(this.file(`${this.sandbox}/Rivals`));
      await this.waitFor(() => this.plugin.data.context.folder === this.sandbox);
      this.check("Deleted current folder falls back to parent", this.plugin.data.context.folder === this.sandbox, this.plugin.data.context.folder);
    });
  }

  async openBoard() {
    const cards = `${this.sandbox}/Cards`;
    await this.app.vault.createFolder(cards);
    for (const [title, status] of [["Card A", "To Do"], ["Card B", "To Do"], ["Card C", "Doing"], ["Card D", "Done"]]) {
      await this.app.vault.create(`${cards}/${title}.md`, `---\nstatus: ${status}\n---\n`);
    }
    const base = `${this.sandbox}/QA Board.base`;
    await this.app.vault.create(base, [
      "filters:", "  and:", `    - file.inFolder("${cards}")`,
      "views:", "  - type: base-board", "    name: QA Board", "    groupBy:", "      property: note.status", "      direction: ASC", "",
    ].join("\n"));
    const leaf = this.app.workspace.getLeaf(Platform.isMobile ? false : "tab");
    await leaf.openFile(this.file(base), { active: true });
    const board = await this.waitFor(() => leaf.view?.containerEl?.querySelector(".base-board-board .base-board-card"), 6000);
    return { leaf, base, cards, board: board && leaf.view.containerEl.querySelector(".base-board-board") };
  }

  async boardFlows(mode) {
    let ctx;
    await this.step("Open test board", async () => {
      ctx = await this.openBoard();
      this.check("Board renders cards", ctx.board, "no .base-board-card rendered");
    });
    if (!ctx?.board) return;
    const { leaf, cards } = ctx;
    const boardEl = () => leaf.view.containerEl.querySelector(".base-board-board");
    const column = (name) => Array.from(boardEl().querySelectorAll(".base-board-column")).find((c) => c.dataset.columnName === name);

    await this.step("Add card: card appears, nothing opens, board stays", async () => {
      const col = column("Doing") || boardEl().querySelector(".base-board-column");
      const colName = col.dataset.columnName;
      if (mode === "mobile") {
        boardEl().scrollTop = 120;
        boardEl().scrollLeft = 200;
      } else {
        boardEl().scrollLeft = 200;
      }
      const before = { top: boardEl().scrollTop, left: boardEl().scrollLeft };
      const plus = col.querySelector(".base-board-column-add-card, .base-board-column-add-card-footer-button");
      this.tap(plus);
      let input;
      if (mode === "mobile") {
        input = await this.waitFor(() => this.q(".rikka-card-composer-input"));
        this.check("Mobile: composer opens", input, "no .rikka-card-composer");
        const bar = this.q(".rikka-card-composer")?.getBoundingClientRect();
        this.check("Mobile: composer is fully on screen", bar && bar.top >= 0 && bar.bottom <= window.innerHeight, JSON.stringify(bar));
      } else {
        input = await this.waitFor(() => col.querySelector(".rikka-board-card-input") || column(colName)?.querySelector(".rikka-board-card-input"));
        this.check("Desktop: inline input opens", input, "no .rikka-board-card-input");
      }
      if (!input) return;
      const leafBefore = this.app.workspace.getMostRecentLeaf();
      for (const title of ["QA new card 1", "QA new card 2"]) {
        input.value = title;
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));
        await this.waitFor(() => this.file(`${cards}/${title}.md`), 4000);
        await this.wait(500);
        if (mode !== "mobile") input = column(colName)?.querySelector(".rikka-board-card-input") || input;
      }
      this.check("Both cards created as files", this.file(`${cards}/QA new card 1.md`) && this.file(`${cards}/QA new card 2.md`));
      const fm = this.app.metadataCache.getFileCache(this.file(`${cards}/QA new card 1.md`))?.frontmatter;
      this.check("Card gets the column's status", fm?.status === colName, JSON.stringify(fm));
      await this.waitFor(() => Array.from(boardEl().querySelectorAll(".base-board-card")).some((c) => c.dataset.filePath === `${cards}/QA new card 2.md`));
      this.check("New card visible on the board", Array.from(boardEl().querySelectorAll(".base-board-card")).some((c) => c.dataset.filePath === `${cards}/QA new card 2.md`));
      this.check("Card detail did NOT open (same leaf shows board)", leaf.view?.file?.path === ctx.base, leaf.view?.file?.path);
      this.check("No modal opened", !this.q(".modal-container .base-board-card-modal"));
      this.check("Active leaf unchanged", this.app.workspace.getMostRecentLeaf() === leafBefore);
      const after = { top: boardEl().scrollTop, left: boardEl().scrollLeft };
      this.check("Board did not jump", Math.abs(after.top - before.top) < 40 && Math.abs(after.left - before.left) < 40, `${JSON.stringify(before)} → ${JSON.stringify(after)}`);
      if (mode === "mobile") {
        this.check("Composer stays open for the next card", this.q(".rikka-card-composer-input"));
        this.tap(this.q(".rikka-card-composer-done"));
        await this.waitFor(() => !this.q(".rikka-card-composer"));
        this.check("Done closes the composer", !this.q(".rikka-card-composer"));
      } else {
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      }
    });

    await this.step("Tap card opens it; Back returns to the same board and position", async () => {
      await this.wait(1300); // past the post-create click guard
      const card = Array.from(boardEl().querySelectorAll(".base-board-card")).find((c) => c.dataset.filePath === `${cards}/Card A.md`);
      const pos = { top: boardEl().scrollTop, left: boardEl().scrollLeft };
      this.tap(card.querySelector(".base-board-card-title") || card);
      if (mode === "mobile") {
        await this.waitFor(() => leaf.view?.file?.path === `${cards}/Card A.md`, 4000);
        this.check("Mobile: card opens in the board's tab", leaf.view?.file?.path === `${cards}/Card A.md`, leaf.view?.file?.path);
        leaf.history?.back?.();
        await this.waitFor(() => leaf.view?.file?.path === ctx.base, 4000);
        this.check("Back returns to the same board", leaf.view?.file?.path === ctx.base, leaf.view?.file?.path);
        await this.waitFor(() => boardEl()?.querySelector(".base-board-card"), 4000);
        await this.wait(500);
        const now = { top: boardEl().scrollTop, left: boardEl().scrollLeft };
        this.check("Scroll position restored", Math.abs(now.top - pos.top) < 60 && Math.abs(now.left - pos.left) < 60, `${JSON.stringify(pos)} → ${JSON.stringify(now)}`);
      } else {
        const opened = await this.waitFor(() => {
          let found = false;
          this.app.workspace.iterateAllLeaves((l) => { if (l.view?.file?.path === `${cards}/Card A.md`) found = true; });
          return found || this.q(".base-board-card-modal");
        }, 4000);
        this.check("Desktop: tapping a card opens it", opened);
        this.q(".base-board-card-modal")?.closest(".modal-container")?.querySelector(".modal-close-button")?.click();
      }
    });

    if (mode === "mobile") {
      await this.step("Phone layout: full-height stacked columns, vertical scroll", async () => {
        if (!document.body.hasClass("is-phone")) { this.check("Phone layout (needs is-phone)", true); return; }
        const style = getComputedStyle(boardEl());
        this.check("Board stacks columns vertically", style.flexDirection === "column", style.flexDirection);
        const cardsBox = boardEl().querySelector(".base-board-cards");
        this.check("Columns are not inner-scroll boxes", getComputedStyle(cardsBox).overflowY === "visible", getComputedStyle(cardsBox).overflowY);
        this.check("No horizontal overflow", boardEl().scrollWidth <= boardEl().clientWidth + 2, `${boardEl().scrollWidth} > ${boardEl().clientWidth}`);
      });
    }
  }

  // kanban.creation / persistence / navigation / edge-cases
  async kanbanAudit(mode) {
    const baseFile = this.file(`${this.sandbox}/QA Board.base`);
    let leaf = this.app.workspace.getLeavesOfType("bases").find((l) => l.view?.file?.path === baseFile?.path);
    if (!leaf && baseFile) {
      leaf = this.app.workspace.getLeaf(Platform.isMobile ? false : "tab");
      await leaf.openFile(baseFile, { active: true });
      await this.waitFor(() => leaf.view?.containerEl?.querySelector(".base-board-board .base-board-card"), 6000);
    }
    const boardEl = () => leaf?.view?.containerEl?.querySelector(".base-board-board");
    if (!boardEl()) { this.check("kanban: board available", false, "QA board not open"); return; }
    const cards = `${this.sandbox}/Cards`;
    const column = (name) => Array.from(boardEl().querySelectorAll(".base-board-column")).find((c) => c.dataset.columnName === name);
    const count = (prefix) => this.file(cards).children.filter((f) => f.name.startsWith(prefix)).length;
    const openInput = async (name) => {
      this.tap(column(name).querySelector(".base-board-column-add-card, .base-board-column-add-card-footer-button"));
      return mode === "mobile"
        ? this.waitFor(() => this.q(".rikka-card-composer-input"))
        : this.waitFor(() => column(name)?.querySelector(".rikka-board-card-input"));
    };
    const closeInput = (input) => {
      if (mode === "mobile") this.tap(this.q(".rikka-card-composer-done"));
      else input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
    };
    const enter = (input) => input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true }));

    await this.step("kanban.creation: whitespace-only title is rejected", async () => {
      const input = await openInput("To Do");
      const before = this.file(cards).children.length;
      input.value = "     ";
      enter(input);
      await this.wait(600);
      this.check("No card created for '     '", this.file(cards).children.length === before, `${before} → ${this.file(cards).children.length}`);
      input.value = "";
      closeInput(input);
      await this.wait(300);
    });

    await this.step("kanban.creation: rapid Enter creates exactly one card", async () => {
      const input = await openInput("To Do");
      input.value = "Rapid card";
      enter(input); enter(input); enter(input);
      if (mode === "mobile") this.tap(this.q(".rikka-card-composer-done"));
      await this.waitFor(() => this.file(`${cards}/Rapid card.md`));
      await this.wait(900);
      this.check("Exactly one 'Rapid card'", count("Rapid card") === 1, `${count("Rapid card")} files`);
      if (mode !== "mobile") closeInput(column("To Do")?.querySelector(".rikka-board-card-input") || input);
      await this.waitFor(() => !this.q(".rikka-card-composer"), 1500);
      this.check("Nothing opened after rapid entry", leaf.view?.file?.path === `${this.sandbox}/QA Board.base`, leaf.view?.file?.path);
    });

    await this.step("kanban.creation: Arabic / emoji / punctuation titles", async () => {
      const input = await openInput("Doing");
      for (const title of ["مهمة جديدة 12", "Launch 🚀 v2", "What's next, really?"]) {
        input.value = title;
        enter(input);
        await this.waitFor(() => this.file(`${cards}/${title.replace("?", "")}.md`), 3000);
        await this.wait(400);
      }
      this.check("Arabic title kept as-is", this.file(`${cards}/مهمة جديدة 12.md`));
      this.check("Emoji title kept as-is", this.file(`${cards}/Launch 🚀 v2.md`));
      this.check("'?' (not allowed in file names) is dropped cleanly", this.file(`${cards}/What's next, really.md`), this.file(cards).children.map((f) => f.name).filter((n) => n.startsWith("What")).join(", ") || "missing");
      closeInput(column("Doing")?.querySelector(".rikka-board-card-input") || input);
      await this.wait(400);
    });

    await this.step("kanban.persistence: new cards go to the bottom with a stable order key", async () => {
      await this.wait(500);
      const doing = column("Doing");
      const paths = Array.from(doing.querySelectorAll(".base-board-card[data-file-path]")).map((c) => c.dataset.filePath);
      const last = paths[paths.length - 1] || "";
      this.check("Last added card is last in its column", /What's next/.test(last), paths.map((p) => p.split("/").pop()).join(", "));
      const order = (p) => this.app.metadataCache.getFileCache(this.file(p))?.frontmatter?.kanban_order;
      this.check("Order key saved in the note", typeof order(`${cards}/Launch 🚀 v2.md`) === "string", JSON.stringify(order(`${cards}/Launch 🚀 v2.md`)));
      const topKey = this.plugin.boardOrderKey(doing, true);
      const keys = paths.map(order).filter((k) => typeof k === "string").sort();
      this.check("'Top' key sorts before every card", keys.length && topKey < keys[0], `${topKey} vs ${keys[0]}`);
    });

    await this.step("kanban.drafts: unfinished text survives closing the input", async () => {
      let input = await openInput("Done");
      input.value = "Half-typed idea";
      if (mode === "mobile") {
        this.plugin.composerCleanup?.(); // what leaving the board does
      } else {
        input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true }));
      }
      await this.wait(300);
      this.check("No card created from the draft", !this.file(`${cards}/Half-typed idea.md`));
      input = await openInput("Done");
      this.check("Draft restored when reopening", input?.value === "Half-typed idea", input?.value);
      input.value = "";
      closeInput(input);
      await this.wait(300);
    });

    await this.step("kanban.drag-alternative: Move to column updates the note and keeps one card", async () => {
      const file = this.file(`${cards}/Card B.md`);
      const info = await this.plugin.getBoardInfo(boardEl());
      await this.plugin.moveCardToColumn(file, boardEl(), "Done", info);
      await this.waitFor(() => column("Done") && Array.from(column("Done").querySelectorAll(".base-board-card")).some((c) => c.dataset.filePath === file.path), 3000);
      const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
      this.check("Note's status changed to Done", fm?.status === "Done", JSON.stringify(fm));
      const where = Array.from(boardEl().querySelectorAll(".base-board-card")).filter((c) => c.dataset.filePath === file.path);
      this.check("Exactly one card on the board", where.length === 1, `${where.length}`);
      this.check("Card shows in Done", where[0]?.closest(".base-board-column")?.dataset.columnName === "Done");
      let failed = false;
      try { await this.plugin.moveCardToColumn(file, boardEl(), "No such column", info); } catch (e) { failed = true; }
      this.check("Missing destination is refused, not dumped somewhere", failed && this.app.metadataCache.getFileCache(file)?.frontmatter?.status === "Done");
    });

    await this.step("kanban.persistence: reopening the board keeps cards and order", async () => {
      const before = Array.from(column("Doing").querySelectorAll(".base-board-card[data-file-path]")).map((c) => c.dataset.filePath).join("|");
      await leaf.openFile(this.file(`${cards}/Card A.md`));
      await this.wait(300);
      await leaf.openFile(this.file(`${this.sandbox}/QA Board.base`));
      await this.waitFor(() => column("Doing")?.querySelector(".base-board-card"), 5000);
      await this.wait(400);
      const after = Array.from(column("Doing").querySelectorAll(".base-board-card[data-file-path]")).map((c) => c.dataset.filePath).join("|");
      this.check("Same cards in the same order", before === after, `${before} → ${after}`);
    });

    if (mode === "mobile" && document.body.hasClass("is-phone")) {
      await this.step("kanban.mobile: column chips", async () => {
        const chips = await this.waitFor(() => leaf.view.containerEl.querySelector(".rikka-column-chips .rikka-column-chip"), 2000);
        this.check("Column chips shown", chips);
        const chip = Array.from(leaf.view.containerEl.querySelectorAll(".rikka-column-chip")).find((c) => c.dataset.column === "Done");
        const n = column("Done").querySelectorAll(".base-board-card[data-file-path]").length;
        this.check("Chip count matches cards", chip?.querySelector(".rikka-column-chip-count")?.textContent === String(n), `${chip?.textContent} vs ${n}`);
        boardEl().scrollTop = 0;
        chip?.click();
        await this.wait(700);
        const offset = column("Done").getBoundingClientRect().top - boardEl().getBoundingClientRect().top;
        this.check("Tapping a chip brings its column to the top", Math.abs(offset) < 60 || boardEl().scrollTop >= boardEl().scrollHeight - boardEl().clientHeight - 2, `offset ${Math.round(offset)}`);
        this.check("Chips fit on screen", leaf.view.containerEl.querySelector(".rikka-column-chips").getBoundingClientRect().height < 60);
      });
    }
    if (mode === "mobile") {
      await this.step("kanban.mobile: a swipe that starts on a card does not open or move it", async () => {
        const card = Array.from(boardEl().querySelectorAll(".base-board-card")).find((c) => c.dataset.filePath === `${cards}/Card A.md`);
        const r = card.getBoundingClientRect();
        const t = (y) => new Touch({ identifier: 7, target: card, clientX: r.left + 20, clientY: y });
        card.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, cancelable: true, touches: [t(r.top + 10)], changedTouches: [t(r.top + 10)] }));
        card.dispatchEvent(new TouchEvent("touchmove", { bubbles: true, cancelable: true, touches: [t(r.top + 60)], changedTouches: [t(r.top + 60)] }));
        await this.wait(450); // past the long-press time
        card.dispatchEvent(new TouchEvent("touchend", { bubbles: true, cancelable: true, touches: [], changedTouches: [t(r.top + 60)] }));
        await this.wait(300);
        this.check("Card not picked up", !card.hasClass("base-board-card--dragging") && !boardEl().querySelector(".base-board-card-placeholder"));
        this.check("Card not opened", leaf.view?.file?.path === `${this.sandbox}/QA Board.base`);
        this.check("No menu opened", !document.querySelector(".menu"));
        this.check("Card stays in its column", this.app.metadataCache.getFileCache(this.file(`${cards}/Card A.md`))?.frontmatter?.status === "To Do");
      });
      await this.step("kanban.mobile: long-press + drag moves exactly once and does not open", async () => {
        boardEl().scrollLeft = Math.max(0, column("Doing").offsetLeft - 10);
        column("Doing").scrollIntoView({ block: "start" });
        await this.wait(200);
        const card = Array.from(boardEl().querySelectorAll(".base-board-card")).find((c) => c.dataset.filePath === `${cards}/Card C.md`);
        const target = column("Done").querySelector(".base-board-cards");
        const r = card.getBoundingClientRect();
        const tr = target.getBoundingClientRect();
        const t = (x, y) => new Touch({ identifier: 9, target: card, clientX: x, clientY: y });
        const start = t(r.left + 30, r.top + 10);
        card.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, cancelable: true, touches: [start], changedTouches: [start] }));
        await this.wait(450);
        this.check("Long-press picks the card up", card.hasClass("base-board-card--dragging"));
        const end = t(tr.left + 30, tr.bottom - 10);
        card.dispatchEvent(new TouchEvent("touchmove", { bubbles: true, cancelable: true, touches: [end], changedTouches: [end] }));
        await this.wait(100);
        card.dispatchEvent(new TouchEvent("touchend", { bubbles: true, cancelable: true, touches: [], changedTouches: [end] }));
        card.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true })); // the click iOS sends after touchend
        await this.waitFor(() => this.app.metadataCache.getFileCache(this.file(`${cards}/Card C.md`))?.frontmatter?.status === "Done", 3000);
        this.check("Note moved to Done", this.app.metadataCache.getFileCache(this.file(`${cards}/Card C.md`))?.frontmatter?.status === "Done");
        await this.wait(400);
        this.check("Exactly one Card C on the board", Array.from(boardEl().querySelectorAll(".base-board-card")).filter((c) => c.dataset.filePath === `${cards}/Card C.md`).length === 1);
        this.check("Drop did not open the card", leaf.view?.file?.path === `${this.sandbox}/QA Board.base`, leaf.view?.file?.path);
      });
    }
  }

  async editorFlows(mode) {
    await this.step("Slash menu opens at a line start and converts in one undo step", async () => {
      const path = `${this.sandbox}/Editor test.md`;
      await this.app.vault.create(path, "Hello\n");
      const leaf = this.app.workspace.getLeaf(Platform.isMobile ? false : "tab");
      await leaf.openFile(this.file(path), { active: true, state: { mode: "source" } });
      await this.waitFor(() => leaf.view?.file?.path === path && leaf.view?.editor, 4000);
      if (leaf.view?.file?.path !== path) throw new Error(`editor opened ${leaf.view?.file?.path}`);
      const editor = leaf.view.editor;
      editor.focus();
      editor.setCursor({ line: 1, ch: 0 });
      editor.replaceRange("/hea", { line: 1, ch: 0 });
      editor.setCursor({ line: 1, ch: 4 });
      // Programmatic edits don't fire the typing event EditorSuggest listens
      // to; trigger it the way a keystroke would.
      this.plugin.slashSuggest?.trigger?.(editor, this.file(path), true);
      const pop = await this.waitFor(() => this.q(".suggestion-container .rikka-slash-item"), 2500);
      this.check("Slash menu appears", pop, "no .rikka-slash-item");
      if (pop) {
        const box = pop.closest(".suggestion-container").getBoundingClientRect();
        this.check("Slash menu fully on screen", box.top >= 0 && box.bottom <= window.innerHeight + 1 && box.left >= 0 && box.right <= window.innerWidth + 1, JSON.stringify(box));
        const first = this.q(".suggestion-container .suggestion-item")?.textContent || "";
        this.check("'/hea' lists Heading first", first.includes("Heading"), first);
      }
      this.plugin.setLineKind(editor, { from: { line: 1, ch: 0 }, to: { line: 1, ch: 4 } }, "h2");
      this.check("Turned into heading", editor.getLine(1).startsWith("## "), editor.getLine(1));
      editor.undo();
      this.check("One undo restores '/hea'", editor.getLine(1) === "/hea", editor.getLine(1));
      this.plugin.slashSuggest?.close?.();
      await this.wait(200);
      editor.setValue("See https://example.com/foo/bar");
      editor.setCursor({ line: 0, ch: editor.getLine(0).length });
      this.plugin.slashSuggest?.trigger?.(editor, this.file(path), true); // try hard to open it
      await this.wait(400);
      this.check("URLs do not open the slash menu", !this.q(".suggestion-container .rikka-slash-item"));
      this.plugin.slashSuggest?.close?.();
      await leaf.view?.save?.();
      leaf.detach();
    });
  }

  async layoutChecks() {
    await this.step("Touch targets and toolbar", async () => {
      const v = this.view();
      // On mobile the Binder lives in a drawer; open it before measuring.
      this.app.workspace.leftSplit?.expand?.();
      await this.plugin.activateView();
      await this.wait(600);
      const buttons = Array.from(v.containerEl.querySelectorAll(".rikka-toolbar .rikka-icon-button"));
      const small = buttons.filter((b) => { const r = b.getBoundingClientRect(); return r.width < 40 || r.height < 40; });
      this.check("Toolbar buttons ≥ 40px", !small.length, small.map((b) => b.getAttribute("aria-label")).join(", "));
      this.check("Toolbar has at most 3 actions", buttons.length <= 3, String(buttons.length));
      const rows = Array.from(v.containerEl.querySelectorAll(".rikka-row")).filter((r) => r.offsetParent).slice(0, 10);
      const shortRows = rows.filter((r) => r.getBoundingClientRect().height < 38);
      this.check("Binder rows ≥ 38px tall", !shortRows.length, `${shortRows.length} short rows`);
      const overflow = v.containerEl.scrollWidth > v.containerEl.clientWidth + 2;
      this.check("Binder has no horizontal overflow", !overflow);
    });
  }
}

// --- orchestration across emulateMobile reloads ---------------------------
function rikkaQaState(next) {
  try {
    if (next === undefined) return JSON.parse(window.localStorage.getItem(RIKKA_QA_KEY) || "null");
    if (next === null) window.localStorage.removeItem(RIKKA_QA_KEY);
    else window.localStorage.setItem(RIKKA_QA_KEY, JSON.stringify(next));
  } catch (error) { return null; }
  return next;
}

class RikkaSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  async display() {
    const { containerEl } = this;
    containerEl.empty();
    const version = await this.plugin.installedVersion();
    new Setting(containerEl)
      .setName("Update Rikka")
      .setDesc(`Installed version: ${version}. Checks GitHub for a newer release and installs it.`)
      .addButton((button) => button
        .setButtonText("Update Rikka")
        .setCta()
        .onClick(async () => {
          button.setDisabled(true).setButtonText("Checking…");
          await this.plugin.installUpdate(true);
          button.setDisabled(false).setButtonText("Update Rikka");
          window.setTimeout(() => this.display(), 1500);
        }));
  }
}

module.exports = class RikkaPlugin extends Plugin {
  async onload() {
    const stored = await this.loadData();
    this.data = Object.assign({}, DEFAULT_DATA, stored && typeof stored === "object" ? stored : {});
    this.projects = Array.isArray(this.data.projects) && this.data.projects.length ? this.data.projects : RIKKA_PROJECTS;
    this.data.projects = this.projects;
    this.data.projectStates = this.asRecord(this.data.projectStates);
    if (!this.data.projectStates.itl) {
      const legacy = {};
      for (const key of Object.keys(DEFAULT_DATA)) legacy[key] = this.data[key];
      const oldRoot = "ITL Obsidian";
      const prefixPath = (path) => path === oldRoot || path.startsWith(`${oldRoot}/`) ? `ITL/${path}` : `ITL/${path}`;
      legacy.research = this.asPathList(legacy.research).map(prefixPath);
      legacy.trash = this.asPathList(legacy.trash).map(prefixPath);
      legacy.templates = this.asPathList(legacy.templates).map(prefixPath);
      legacy.collections = Object.fromEntries(Object.entries(this.asCollections(legacy.collections)).map(([name, paths]) => [name, paths.map(prefixPath)]));
      legacy.collapsed = Object.fromEntries(Object.entries(this.asRecord(legacy.collapsed)).map(([key, value]) => {
        if (!key.startsWith("folder:")) return [key, value];
        const marker = key.indexOf(":", 7);
        if (marker < 0) return [key, value];
        const path = key.slice(marker + 1);
        return [key.slice(0, marker + 1) + prefixPath(path), value];
      }));
      this.data.projectStates.itl = legacy;
    }
    this.data.activeProject = this.projects.some((project) => project.id === this.data.activeProject) ? this.data.activeProject : "itl";
    this.loadActiveProjectState();
    this.data.collapsed = this.asRecord(this.data.collapsed);
    this.data.research = this.asPathList(this.data.research);
    this.data.trash = this.asPathList(this.data.trash);
    this.data.templates = this.asPathList(this.data.templates);
    this.data.collections = this.asCollections(this.data.collections);
    delete this.data.wordTarget;
    for (const state of Object.values(this.data.projectStates || {})) if (state && typeof state === "object") delete state.wordTarget;
    this.wordCountCache = new Map();
    this.stateSaveQueue = Promise.resolve();

    this.registerView(VIEW_TYPE, (leaf) => new RikkaBinderView(leaf, this));
    this.addRibbonIcon("library", "Open Rikka Binder", () => this.runSafely(() => this.activateView(), "Open Rikka Binder"));
    this.addCommand({ id: "open-binder", name: "Open Rikka Binder", callback: () => this.runSafely(() => this.activateView(), "Open Rikka Binder") });
    this.addCommand({ id: "new-draft-note", name: "New document in Draft", callback: () => this.promptNewNote() });
    this.addCommand({ id: "new-draft-folder", name: "New folder in Draft", callback: () => this.promptNewFolder() });

    this.registerEvent(this.app.vault.on("create", (file) => {
      if (this.isInActiveProject(file.path)) this.refreshViews();
    }));
    this.registerEvent(this.app.vault.on("delete", (file) => {
      // Deleting the page you're looking at returns you to where you came
      // from (the board for a card, the previous page), or on mobile to the
      // Binder at your current location — never a blank pane.
      if (file instanceof TFile) {
        const leaves = [];
        this.app.workspace.iterateRootLeaves((leaf) => { if (this.leafFiles.get(leaf) === file.path) leaves.push(leaf); });
        if (leaves.length) window.setTimeout(() => {
          for (const leaf of leaves) {
            if (leaf.view?.getViewType?.() !== "empty" && leaf.view?.file) continue;
            if (leaf.history?.backHistory?.length) leaf.history.back();
            else if (Platform.isMobile) this.runSafely(() => this.activateView(), "Show Binder");
          }
        }, 120);
      }
      void this.removeStoredPath(file.path).catch((error) => {
        console.error("Rikka cleanup after deletion failed", error);
        new Notice(`Could not update Rikka after deletion: ${error?.message || error}`);
      });
      if (this.isInActiveProject(file.path)) this.refreshViews();
    }));
    this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {
      void this.renameStoredPath(oldPath, file.path).catch((error) => {
        console.error("Rikka path update after rename failed", error);
        new Notice(`Could not update Rikka after rename: ${error?.message || error}`);
      });
      if (this.isInActiveProject(file.path) || this.isInActiveProject(oldPath)) this.refreshViews();
    }));
    this.registerEvent(this.app.vault.on("modify", (file) => {
      if (!this.isInActiveProject(file.path)) return;
      this.wordCountCache.delete(file.path);
      // Typing only changes word counts: update them quietly instead of re-rendering.
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = window.setTimeout(() => this.updateWordCounts(), 1200);
    }));

    // Which file each tab shows, so deleting it can navigate sensibly.
    this.leafFiles = new WeakMap();
    this.registerEvent(this.app.workspace.on("file-open", (file) => {
      const leaf = this.app.workspace.getMostRecentLeaf?.();
      if (leaf && file) this.leafFiles.set(leaf, file.path);
      if (file && this.isInActiveProject(file.path)) this.getView()?.setSelected(file.path);
    }));

    this.installBoardCreationSupport();
    this.installMobileBoardSupport();
    this.installNewCardOpenGuard();
    this.installEditorFeatures();
    this.installUpdateChecker();
    this.installQA();

    this.app.workspace.onLayoutReady(() => {
      this.validateContext();
      this.runSafely(() => this.activateView(), "Open Rikka Binder");
    });
  }

  // ---- QA commands (desktop / mobile emulation / all) ---------------------
  installQA() {
    this.addCommand({ id: "qa-desktop", name: "QA: run desktop tests", callback: () => this.startQA(["desktop"]) });
    this.addCommand({ id: "qa-mobile", name: "QA: run mobile tests (emulated)", callback: () => this.startQA(["mobile"]) });
    this.addCommand({ id: "qa-all", name: "QA: run all tests (desktop + mobile)", callback: () => this.startQA(["desktop", "mobile"]) });
    this.app.workspace.onLayoutReady(() => window.setTimeout(() => this.resumeQA(), 2500));
  }

  async startQA(queue) {
    rikkaQaState({ queue: [...queue, "finish"], results: {}, desktopWasMobile: Platform.isMobile });
    await this.resumeQA();
  }

  // Runs the next queued step. Switching between desktop and mobile uses
  // Obsidian's own app.emulateMobile(), which reloads; we resume afterwards.
  async resumeQA() {
    const state = rikkaQaState();
    if (!state?.queue?.length || this.qaRunning) return;
    const next = state.queue[0];
    const wantMobile = next === "mobile";
    if (next === "finish") {
      if (Platform.isMobile && !state.desktopWasMobile) return this.switchEmulation(false);
      rikkaQaState(null);
      new RikkaQAReportModal(this.app, state.results).open();
      return;
    }
    if (Platform.isMobile !== wantMobile) return this.switchEmulation(wantMobile);
    this.qaRunning = true;
    new Notice(`Rikka QA: running ${next} tests…`);
    try {
      const rows = await new RikkaQA(this).run(next);
      state.results[next === "mobile" ? "Mobile (emulated)" : "Desktop"] = rows;
    } catch (error) {
      state.results[next] = [{ name: "Suite crashed", ok: false, detail: error?.stack || String(error) }];
    } finally {
      this.qaRunning = false;
    }
    state.queue.shift();
    rikkaQaState(state);
    await this.resumeQA();
  }

  switchEmulation(mobile) {
    if (typeof this.app.emulateMobile !== "function") {
      const state = rikkaQaState();
      state.results.Setup = [{ name: "app.emulateMobile is available", ok: false, detail: "not available in this Obsidian build" }];
      state.queue = ["finish"];
      rikkaQaState(state);
      return this.resumeQA();
    }
    this.app.emulateMobile(mobile);
    // If this Obsidian version switches without a full reload, continue here.
    window.setTimeout(() => { if (!this.unloaded) this.resumeQA(); }, 4000);
  }

  onunload() {
    this.unloaded = true;
    this.composerCleanup?.();
    window.clearTimeout(this.refreshTimer);
    window.clearTimeout(this.renderTimer);
    this.mobileBoardObserver?.disconnect();
    for (const cleanup of this.mobileBoardCleanups || []) cleanup();
    this.mobileBoardCleanups?.clear();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }

  installBoardCreationSupport() {
    const enhance = () => {
      // Long titles are clamped to 3 lines; the full title shows on hover.
      if (!Platform.isMobile) document.querySelectorAll(".base-board-card-title span:not([title])").forEach((span) => { span.title = span.textContent || ""; });
      document.querySelectorAll(".base-board-column").forEach((column) => {
        if (column.querySelector(".base-board-column-add-card-footer")) return;
        const footer = column.createDiv({ cls: "base-board-column-add-card-footer" });
        footer.createEl("button", {
          cls: "base-board-column-add-card-footer-button",
          text: "+ Add card",
          attr: { type: "button", "aria-label": `Add card to ${column.dataset.columnName || "column"}` }
        });
      });
    };
    this.registerDomEvent(document, "click", (event) => {
      const button = event.target?.closest?.(".base-board-column-add-card, .base-board-column-add-card-footer-button");
      if (!button) return;
      const column = button.closest(".base-board-column");
      if (!column) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (Platform.isMobile) this.startBoardCardComposer(column);
      else this.startBoardCardInput(column);
    }, true);
    const observer = new MutationObserver(this.frameThrottle(enhance));
    observer.observe(this.app.workspace.containerEl, { childList: true, subtree: true });
    this.register(() => observer.disconnect());
    enhance();
  }

  // Scroll only the column's own card list so the input is visible — never the
  // board sideways or the page (scrollIntoView would move every ancestor).
  revealInColumn(el) {
    const list = el.closest(".base-board-cards");
    if (!list) return;
    const box = el.getBoundingClientRect();
    const view = list.getBoundingClientRect();
    if (box.bottom > view.bottom) list.scrollTop += box.bottom - view.bottom + 8;
    else if (box.top < view.top) list.scrollTop -= view.top - box.top + 8;
  }

  // Mobile: a composer bar pinned just above the keyboard. It lives outside the
  // board, so Base Board redrawing the column can't move or remove it, the
  // keyboard never covers it, and nothing on the board scrolls or jumps.
  // Return adds the card and keeps the bar ready for the next one; Done closes.
  async startBoardCardComposer(column) {
    document.querySelector(".rikka-card-composer")?.remove();
    const columnName = column.dataset.columnName || "";
    const board = column.closest(".base-board-board");
    const info = await this.getBoardInfo(column);
    if (!info) { new Notice("Open the board as a page before adding a card."); return; }
    const liveColumn = () => {
      if (column.isConnected) return column;
      const fresh = Array.from(board?.querySelectorAll(".base-board-column") || []).find((el) => el.dataset.columnName === columnName);
      if (fresh) column = fresh;
      return column;
    };

    const bar = document.body.createDiv({ cls: "rikka-card-composer" });
    const label = bar.createDiv({ cls: "rikka-card-composer-label" });
    label.createSpan({ text: "Add card to " });
    label.createSpan({ cls: "rikka-card-composer-column", text: columnName || "column" });
    const status = label.createSpan({ cls: "rikka-card-composer-status" });
    const row = bar.createDiv({ cls: "rikka-card-composer-row" });
    const input = row.createEl("input", {
      cls: "rikka-card-composer-input",
      attr: { type: "text", placeholder: "Card title", enterkeyhint: "send", autocapitalize: "sentences", autocomplete: "off", "aria-label": `New card in ${columnName}` },
    });
    const done = row.createEl("button", { cls: "rikka-card-composer-done", text: "Done", attr: { type: "button" } });

    // Pinned to the top of the visible screen (under Obsidian's header), the
    // one place the keyboard can never cover. Follows the visual viewport so
    // it stays put even if iOS scrolls the page when the keyboard opens.
    const vv = window.visualViewport;
    const header = document.querySelector(".workspace-leaf.mod-active .view-header, .view-header");
    const headerBottom = () => Math.max(0, header?.getBoundingClientRect().bottom || 0);
    const place = () => {
      bar.style.top = `${(vv?.offsetTop || 0) + headerBottom()}px`;
    };
    place();
    vv?.addEventListener("resize", place);
    vv?.addEventListener("scroll", place);

    // Unfinished text survives leaving the board (Back, switching notes, Esc)
    // and is waiting in the bar next time it opens for this column.
    this.cardDrafts ||= new Map();
    const draftKey = `${info.baseFile.path}::${columnName}`;
    if (this.cardDrafts.get(draftKey)) input.value = this.cardDrafts.get(draftKey);
    let busy = false;
    let closed = false;
    let offLayout = null;
    const close = () => {
      if (closed) return;
      closed = true;
      if (input.value.trim()) this.cardDrafts.set(draftKey, input.value); else this.cardDrafts.delete(draftKey);
      if (offLayout) this.app.workspace.offref(offLayout);
      vv?.removeEventListener("resize", place);
      vv?.removeEventListener("scroll", place);
      input.blur();
      bar.remove();
    };
    let inflight = null;
    const add = async () => {
      if (busy) return inflight; // Return + Done at once: wait, never duplicate
      const title = input.value.trim();
      if (!title) return false;
      busy = true;
      inflight = (async () => {
      this.armNewCardGuard();
      try {
        await this.createBoardCard(liveColumn(), title, info);
        if (input.value.trim() === title) input.value = ""; // keep anything typed meanwhile
        status.setText(" · added");
        window.setTimeout(() => status.setText(""), 1200);
        return true;
      } catch (error) {
        new Notice(`Could not add card: ${error?.message || error}`);
        return false;
      } finally {
        busy = false;
      }
      })();
      return inflight;
    };
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        event.stopPropagation();
        void add();          // keyboard stays up for the next card
      } else if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
    });
    // Done: add what's typed (if anything), then close.
    done.addEventListener("pointerdown", (event) => event.preventDefault()); // keep focus until we're done
    done.addEventListener("click", async () => {
      if (busy) await inflight;
      if (input.value.trim() && !(await add())) return; // keep the bar if adding failed
      close();
    });
    // Leaving the board (back, switching notes) closes the bar.
    const leaf = info.leaf;
    offLayout = this.app.workspace.on("active-leaf-change", (active) => { if (active && active !== leaf) close(); });
    this.composerCleanup?.();
    this.composerCleanup = close;
    input.focus({ preventScroll: true });
  }

  startBoardCardInput(column) {
    const existing = column.querySelector(".rikka-board-card-input");
    if (existing) { existing.focus(); return; }
    const cards = column.querySelector(".base-board-cards");
    if (!cards) return;
    const wrapper = cards.createDiv({ cls: "base-board-add-card-input-wrapper rikka-board-input-wrapper" });
    const input = wrapper.createEl("input", {
      cls: "base-board-add-card-input rikka-board-card-input",
      attr: { type: "text", placeholder: "Card title", "aria-label": "New card title", inputmode: "text", autocapitalize: "sentences", autocomplete: "off" }
    });
    this.cardDrafts ||= new Map();
    const draftKey = `${column.closest(".base-board-board") ? (this.app.workspace.getActiveFile()?.path || "") : ""}::${column.dataset.columnName || ""}`;
    if (this.cardDrafts.get(draftKey)) input.value = this.cardDrafts.get(draftKey);
    let busy = false;
    let closed = false;
    let lastCommit = 0;
    const close = () => {
      if (closed) return;
      closed = true;
      if (input.value.trim()) this.cardDrafts.set(draftKey, input.value); else this.cardDrafts.delete(draftKey);
      wrapper.remove();
    };
    // keepOpen: Enter adds the card and leaves the field ready for the next one.
    const commit = async (keepOpen) => {
      const title = input.value.trim();
      if (busy || !title) return;
      busy = true;
      this.armNewCardGuard();
      try {
        await this.createBoardCard(column, title);
        lastCommit = Date.now();
        if (input.value.trim() === title) input.value = "";
        if (keepOpen && !closed) {
          // Base Board may redraw the column after the file appears; re-attach
          // the input to the current column so rapid entry keeps working.
          const columnName = column.dataset.columnName;
          const board = column.closest(".base-board-board");
          const reattach = () => {
            if (closed) return;
            const liveColumn = wrapper.isConnected ? wrapper.closest(".base-board-column")
              : Array.from(board?.querySelectorAll(".base-board-column") || []).find((el) => el.dataset.columnName === columnName);
            const liveCards = liveColumn?.querySelector(".base-board-cards");
            if (!liveCards) { close(); return; }
            liveCards.appendChild(wrapper);
            input.focus({ preventScroll: true });
            this.revealInColumn(wrapper);
          };
          reattach();
          window.setTimeout(reattach, 250);
        } else {
          close();
        }
      } catch (error) {
        new Notice(`Could not add card: ${error?.message || error}`);
        if (!closed) input.focus();
      } finally {
        busy = false;
      }
    };
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.mobileDragClickSuppression = Date.now() + 1200;
        void commit(true);
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
      }
    });
    // Tapping/clicking away saves what was typed instead of discarding it.
    input.addEventListener("blur", () => {
      window.setTimeout(() => {
        if (closed || busy || document.activeElement === input) return;
        // Blur caused by the board redrawing right after a card was added.
        if (Date.now() - lastCommit < 600) return;
        if (input.value.trim()) void commit(false); else close();
      }, 0);
    });
    input.focus({ preventScroll: true });
    this.revealInColumn(wrapper);
  }

  async createBoardCard(column, title, knownInfo = null) {
    const info = knownInfo || await this.getBoardInfo(column);
    if (!info) throw new Error("Open the board as a page before adding a card.");
    const { baseFile, config, groupProperty } = info;
    // Put the card where the board will actually show it: the board's
    // "new item folder" if set, else the folder its filter looks in
    // (file.inFolder("…")), else next to the .base file.
    const baseText = info.raw || "";
    const filterFolder = (baseText.match(/file\.inFolder\(\s*["']([^"']+)["']\s*\)/) || [])[1];
    const folder = config?.newItemFolder
      || (filterFolder && this.app.vault.getAbstractFileByPath(filterFolder) instanceof TFolder ? filterFolder : "")
      || baseFile.parent?.path || "";
    // Characters files can't hold: ":" and "/" become " - ", the rest are dropped.
    const safeTitle = title.replace(/[\\/:]/g, " - ").replace(/[*?"<>|\u0000-\u001f]/g, "").replace(/[#^\[\]]/g, "").replace(/\s+/g, " ").replace(/^[.\s]+|[.\s]+$/g, "").slice(0, 160);
    if (!safeTitle) throw new Error("Enter a title for the card.");
    if (!config?.newCardsToTop) await this.ensureColumnOrderKeys(column);
    const order = this.boardOrderKey(column, !!config?.newCardsToTop);
    const properties = { ...(config?.newItemProperties || {}), [groupProperty]: column.dataset.columnName, kanban_order: order };
    let path = `${folder ? folder + "/" : ""}${safeTitle}.md`;
    for (let suffix = 2; this.app.vault.getAbstractFileByPath(path); suffix++) {
      path = `${folder ? folder + "/" : ""}${safeTitle} ${suffix}.md`;
    }
    // Creating through the vault keeps Bases from opening the new note/properties.
    // The board refreshes from the normal vault event while its tab stays active.
    await this.app.vault.create(path, `---\n${stringifyYaml(properties).trimEnd()}\n---\n\n`);
    this.noticeIfHiddenByFilter(column, path, safeTitle);
    return path;
  }

  // Base Board always shows cards without a kanban_order last. Before adding a
  // card to the bottom, give those cards keys in their current on-screen order
  // (what Base Board itself does on the first drag), so "bottom" means bottom.
  async ensureColumnOrderKeys(column) {
    const cards = Array.from(column?.querySelectorAll?.(".base-board-card[data-file-path]") || []);
    const files = cards.map((c) => this.app.vault.getAbstractFileByPath(c.dataset.filePath)).filter((f) => f instanceof TFile);
    const order = (f) => this.app.metadataCache.getFileCache(f)?.frontmatter?.kanban_order;
    const missing = files.filter((f) => order(f) === undefined || order(f) === null || order(f) === "");
    if (!missing.length || files.some((f) => typeof order(f) === "number")) return;
    let last = files.map(order).filter((k) => typeof k === "string" && k).sort().pop() || null;
    for (const file of missing) {
      last = last ? last + "V" : "a0";
      const key = last;
      await this.app.fileManager.processFrontMatter(file, (fm) => { fm.kanban_order = key; });
    }
    await new Promise((resolve) => window.setTimeout(resolve, 50));
  }

  // Order key for a card placed at the top or bottom of a column, using Base
  // Board's own fractional keys (kanban_order) so manual order persists.
  boardOrderKey(column, atTop = false) {
    const DIGITS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const values = Array.from(column?.querySelectorAll?.(".base-board-card[data-file-path]") || []).map((card) => {
      const file = this.app.vault.getAbstractFileByPath(card.dataset.filePath);
      return file && this.app.metadataCache.getFileCache(file)?.frontmatter?.kanban_order;
    });
    const keys = values.filter((v) => typeof v === "string" && v).sort();
    const numbers = values.filter((v) => typeof v === "number" && Number.isFinite(v));
    if (!keys.length) {
      if (numbers.length) return atTop ? Math.min(...numbers) - 1000 : Math.max(...numbers) + 1000;
      return "a0";
    }
    if (!atTop) return keys[keys.length - 1] + "V";
    const first = keys[0];
    // Decrement the integer part ("a5" → "a4", "a0" → "Zz"); keys sort as strings.
    if (/^a[0-9A-Za-z]/.test(first) && first[1] !== "0") return "a" + DIGITS[DIGITS.indexOf(first[1]) - 1];
    if (/^a0/.test(first)) return "Zz";
    if (/^Z[0-9A-Za-z]{2}/.test(first) && first.slice(1, 3) !== "00") {
      let n = DIGITS.indexOf(first[1]) * 62 + DIGITS.indexOf(first[2]) - 1;
      return "Z" + DIGITS[Math.floor(n / 62)] + DIGITS[n % 62];
    }
    return keys[keys.length - 1] + "V"; // extreme edge: fall back to the bottom
  }

  // Non-drag move (card menu): change the column property and put the card
  // at the bottom of the destination, in one frontmatter write.
  async moveCardToColumn(file, board, name, info) {
    const target = Array.from(board?.querySelectorAll(".base-board-column") || []).find((c) => c.dataset.columnName === name);
    if (!target) throw new Error(`Column “${name}” no longer exists.`);
    const order = this.boardOrderKey(target, false);
    await this.app.fileManager.processFrontMatter(file, (fm) => { fm[info.groupProperty] = name; fm.kanban_order = order; });
  }

  // A board filter can hide a freshly created card; say so instead of
  // letting it look like nothing happened.
  noticeIfHiddenByFilter(column, path, title) {
    const board = column?.closest?.(".base-board-board");
    if (!board) return;
    const visible = () => Array.from(board.querySelectorAll(".base-board-card[data-file-path]")).some((c) => c.dataset.filePath === path);
    window.setTimeout(() => {
      if (!board.isConnected || visible()) return;
      window.setTimeout(() => {
        if (board.isConnected && !visible() && this.app.vault.getAbstractFileByPath(path)) {
          new Notice(`Added “${title}”, but this board's filter hides it.`);
        }
      }, 1500);
    }, 500);
  }

  // ---- Board cards: create != open, and native back navigation ----
  //
  // Base Board creates cards through Obsidian's BasesView.createFileForView(),
  // which creates the note AND opens it. Its default "modal" open behaviour
  // shows the note in a CardDetailModal built on a detached leaf, which is
  // outside navigation history, so the back button can't dismiss it.
  //
  // 1. While a card is being created, WorkspaceLeaf.openFile() is blocked for
  //    the newly created note, so creating a card never opens anything.
  // 2. On mobile, tapping a card opens the note in the board's own tab
  //    (getLeaf(false)), so Obsidian's normal back button returns to the board.
  armNewCardGuard() {
    this.newCardGuardUntil = Date.now() + 3000;
  }

  isGuardedNewCard(file) {
    return file instanceof TFile && Date.now() < this.newCardGuardUntil && this.newCardPaths.has(file.path);
  }

  installNewCardOpenGuard() {
    const { WorkspaceLeaf } = require("obsidian");
    this.newCardPaths = new Set();
    this.newCardGuardUntil = 0;
    this.registerEvent(this.app.vault.on("create", (file) => {
      if (Date.now() >= this.newCardGuardUntil || !(file instanceof TFile) || file.extension !== "md") return;
      // Only files that are new cards: created in a folder that already holds
      // cards of an open board. Other notes created meanwhile open normally.
      const folder = file.parent?.path || "";
      const isCardFolder = Array.from(document.querySelectorAll(".base-board-card[data-file-path]"))
        .some((card) => (card.dataset.filePath || "").replace(/\/[^/]*$/, "") === folder);
      if (!isCardFolder) return;
      this.newCardPaths.add(file.path);
      window.setTimeout(() => this.newCardPaths.delete(file.path), 3000);
    }));

    // Block opening a just-created card (covers getLeaf().openFile and openLinkText).
    const plugin = this;
    const original = WorkspaceLeaf.prototype.openFile;
    WorkspaceLeaf.prototype.openFile = function (file, ...rest) {
      if (plugin.isGuardedNewCard(file)) {
        plugin.newCardPaths.delete(file.path);
        // A brand-new empty tab/split created only to show the card: remove it.
        if (this.view?.getViewType?.() === "empty") window.setTimeout(() => this.detach(), 0);
        return Promise.resolve();
      }
      return original.call(this, file, ...rest);
    };
    this.register(() => { WorkspaceLeaf.prototype.openFile = original; });

    // Arm the guard whenever Base Board's own add-card input commits (Enter or blur).
    this.registerDomEvent(document, "keydown", (event) => {
      if (event.key === "Enter" && event.target?.matches?.(".base-board-add-card-input")) this.armNewCardGuard();
    }, true);
    this.registerDomEvent(document, "focusout", (event) => {
      const input = event.target;
      if (input?.matches?.(".base-board-add-card-input") && input.value?.trim()) this.armNewCardGuard();
    }, true);

    // An intentional tap/click on a card always opens it, even right after creation.
    this.registerDomEvent(document, "pointerdown", (event) => {
      const card = event.target?.closest?.(".base-board-card[data-file-path]");
      if (card) this.newCardPaths.delete(card.dataset.filePath);
    }, true);

    // Mobile: open cards in the board's tab so the native back button works.
    if (Platform.isMobile) {
      this.registerDomEvent(document, "click", (event) => {
        if (Date.now() < (this.mobileDragClickSuppression || 0)) return;
        const target = event.target;
        const card = target?.closest?.(".base-board-card[data-file-path]");
        if (!card || target.closest("button, input, textarea, select, a, .base-board-card-edit")) return;
        const file = this.app.vault.getAbstractFileByPath(card.dataset.filePath);
        if (!(file instanceof TFile)) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        let leaf = null;
        this.app.workspace.iterateAllLeaves((candidate) => {
          if (!leaf && candidate.view?.containerEl?.contains(card)) leaf = candidate;
        });
        this.rememberBoardScroll(card, leaf);
        (leaf || this.app.workspace.getLeaf(false)).openFile(file, { active: true });
      }, true);

      // Back to the board: restore where the user was.
      this.registerEvent(this.app.workspace.on("file-open", (file) => {
        const saved = this.savedBoardScroll;
        if (!saved || file?.path !== saved.basePath) return;
        const restore = () => {
          const board = saved.leaf?.view?.containerEl?.querySelector(".base-board-board");
          if (!board) return false;
          board.scrollLeft = saved.left;
          board.scrollTop = saved.top || 0; // phone layout scrolls the board vertically
          board.querySelectorAll(".base-board-column").forEach((column) => {
            const top = saved.columns[column.dataset.columnName];
            const cards = column.querySelector(".base-board-cards");
            if (cards && Number.isFinite(top)) cards.scrollTop = top;
          });
          return true;
        };
        // The board renders asynchronously; retry briefly until it exists.
        let tries = 0;
        const tick = () => {
          if (restore()) window.setTimeout(restore, 200); // once more after late layout
          else if (++tries < 10) window.setTimeout(tick, 60);
        };
        window.setTimeout(tick, 30);
        this.savedBoardScroll = null;
      }));
    }
  }


  // The .base file and grouping property behind a board element.
  async getBoardInfo(el) {
    let boardLeaf;
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view?.containerEl?.contains(el)) boardLeaf = leaf;
    });
    const statePath = boardLeaf?.view?.getState?.()?.file;
    const baseFile = boardLeaf?.view?.file || (statePath && this.app.vault.getAbstractFileByPath(statePath));
    if (!(baseFile instanceof TFile) || baseFile.extension !== "base") return null;
    const raw = await this.app.vault.read(baseFile);
    const definition = parseYaml(raw) || {};
    const config = (definition.views || []).find((view) => view.type === "base-board");
    return { leaf: boardLeaf, baseFile, config, raw, groupProperty: (config?.groupBy?.property || "status").replace(/^note\./, "") };
  }

  showCardMenu(card, point) {
    const file = this.app.vault.getAbstractFileByPath(card.dataset.filePath);
    if (!(file instanceof TFile)) return;
    const menu = new Menu();
    const safe = (action, label) => () => this.runSafely(action, label);
    menu.addItem((entry) => entry.setTitle("Open").setIcon("file").onClick(() => {
      this.newCardPaths?.delete(file.path);
      let leaf = null;
      this.app.workspace.iterateAllLeaves((candidate) => { if (!leaf && candidate.view?.containerEl?.contains(card)) leaf = candidate; });
      this.rememberBoardScroll(card, leaf);
      (leaf || this.app.workspace.getLeaf(false)).openFile(file, { active: true });
    }));
    menu.addItem((entry) => entry.setTitle("Rename…").setIcon("pencil").onClick(() => this.promptRename(file)));
    menu.addItem((entry) => entry.setTitle("Move to column…").setIcon("columns-3").onClick(safe(async () => {
      const board = card.closest(".base-board-board");
      const current = card.closest(".base-board-column")?.dataset.columnName;
      const names = Array.from(board?.querySelectorAll(".base-board-column") || []).map((column) => column.dataset.columnName).filter(Boolean);
      const info = await this.getBoardInfo(card);
      if (!info) throw new Error("Couldn't find this board's settings.");
      const choices = names.map((name) => ({ value: name, label: name === current ? `${name}  · current` : name }));
      new RikkaChoiceModal(this.app, `Move “${file.basename}” to column…`, choices, (name) => {
        if (name === current) return;
        return this.moveCardToColumn(file, board, name, info);
      }).open();
    }, "Move to column")));
    menu.addItem((entry) => entry.setTitle("Duplicate").setIcon("copy").onClick(safe(async () => {
      const parent = file.parent?.path && file.parent.path !== "/" ? file.parent.path : "";
      const copy = await this.app.vault.copy(file, this.availablePath(parent, `${file.basename} copy`, file.extension));
      new Notice(`Duplicated as “${copy.basename}”.`);
    }, "Duplicate card")));
    menu.addSeparator();
    menu.addItem((entry) => entry.setTitle("Delete").setIcon("trash-2").setWarning(true).onClick(safe(async () => {
      // Uses Obsidian's own trash setting (system trash or .trash), so it's recoverable.
      await this.app.fileManager.trashFile(file);
      new Notice(`Deleted “${file.basename}”.`);
    }, "Delete card")));
    menu.showAtPosition(point);
  }

  rememberBoardScroll(card, leaf) {
    const board = card.closest(".base-board-board");
    const basePath = leaf?.view?.file?.path || leaf?.view?.getState?.()?.file;
    if (!board || !basePath) return;
    const columns = {};
    board.querySelectorAll(".base-board-column").forEach((column) => {
      const cards = column.querySelector(".base-board-cards");
      if (cards) columns[column.dataset.columnName] = cards.scrollTop;
    });
    this.savedBoardScroll = { basePath, leaf, left: board.scrollLeft, top: board.scrollTop, columns };
  }

  installMobileBoardSupport() {
    if (!Platform.isMobile) return;
    // Whatever opened Base Board's own inline "new card" input, swap it for
    // Rikka's composer so typing is always visible and nothing jumps.
    this.registerDomEvent(document, "focusin", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || !input.matches(".base-board-add-card-input") || input.matches(".rikka-board-card-input")) return;
      const column = input.closest(".base-board-column");
      if (!column) return;
      const wrapper = input.closest(".base-board-add-card-input-wrapper");
      input.value = "";
      input.blur();
      // Removing Base Board's input after clearing it means its blur-commit does nothing.
      window.setTimeout(() => {
        wrapper?.remove();
        column.querySelectorAll(".base-board-hidden").forEach((el) => el.classList.remove("base-board-hidden"));
      }, 0);
      void this.startBoardCardComposer(column);
    }, true);
    // One gesture = one menu: Rikka's long-press menu replaces the long-press
    // context menu on board cards, so two menus never stack up.
    this.registerDomEvent(document, "contextmenu", (event) => {
      if (!event.target?.closest?.(".base-board-card")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    this.mobileDragClickSuppression = 0;
    this.mobileBoardCleanups = new Set();
    this.registerDomEvent(document, "keydown", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || !input.matches(".base-board-add-card-input") || input.matches(".rikka-board-card-input")) return;
      if (event.key !== "Enter") return;
      // Base Board commits on both Enter and blur. Handling Enter here keeps
      // the key from reaching Obsidian after Base Board removes its input;
      // blur then commits through Base Board's existing, supported path.
      event.preventDefault();
      event.stopImmediatePropagation();
      this.mobileDragClickSuppression = Date.now() + 1200;
      this.armNewCardGuard();
      input.blur();
    }, true);
    this.registerDomEvent(document, "focusin", (event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || !input.matches(".base-board-add-card-input")) return;
      input.setAttribute("inputmode", "text");
      input.setAttribute("autocapitalize", "sentences");
      input.setAttribute("autocomplete", "off");
    }, true);
    this.registerDomEvent(document, "click", (event) => {
      if (Date.now() >= this.mobileDragClickSuppression) return;
      if (!event.target?.closest?.(".base-board-card")) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    const attachTouchDrag = () => {
      for (const leaf of this.app.workspace.getLeavesOfType("bases")) {
        const board = leaf.view?.containerEl?.querySelector(".base-board-board");
        const manager = board && this.findBoardDragManager(leaf, board);
        if (!manager || !board || manager.__rikkaTouchBoard === board) continue;
        manager.__rikkaTouchCleanup?.();
        let state = null;
        let timer = 0;
        // Phone layout stacks columns, so the board itself scrolls vertically:
        // scroll it gently while a dragged card is held near its top/bottom edge.
        let edgeSpeed = 0;
        let edgeRAF = 0;
        const stopEdge = () => { edgeSpeed = 0; if (edgeRAF) cancelAnimationFrame(edgeRAF); edgeRAF = 0; };
        const edgeScroll = (y) => {
          const rect = board.getBoundingClientRect();
          const ZONE = 70, MAX = 9;
          edgeSpeed = y < rect.top + ZONE ? -MAX * (1 - Math.max(0, y - rect.top) / ZONE)
            : y > rect.bottom - ZONE ? MAX * (1 - Math.max(0, rect.bottom - y) / ZONE) : 0;
          if (edgeSpeed && !edgeRAF) {
            const tick = () => {
              if (!edgeSpeed || !state?.active) { edgeRAF = 0; return; }
              board.scrollTop += edgeSpeed;
              edgeRAF = requestAnimationFrame(tick);
            };
            edgeRAF = requestAnimationFrame(tick);
          }
        };
        const clearPending = () => {
          window.clearTimeout(timer);
          timer = 0;
          if (!state?.active) state = null;
        };
        const onStart = (event) => {
          if (event.touches.length !== 1 || !(event.target instanceof Element)) return;
          const card = event.target.closest(".base-board-card");
          if (!card || event.target.closest("button, input, a, textarea, select")) return;
          const touch = event.touches[0];
          state = { card, id: touch.identifier, x: touch.clientX, y: touch.clientY, lastX: touch.clientX, lastY: touch.clientY, active: false };
          timer = window.setTimeout(() => {
            if (!state || state.card !== card) return;
            const rect = card.getBoundingClientRect();
            manager.clearDropHighlight();
            manager.dragType = "card";
            manager.draggedEl = card;
            manager.draggedCardHeight = rect.height;
            manager.placeholderEl = board.createDiv();
            manager.placeholderEl.className = "base-board-card-placeholder";
            manager.placeholderEl.style.height = `${rect.height}px`;
            card.parentElement?.insertBefore(manager.placeholderEl, card);
            card.addClass("base-board-card--dragging");
            board.addClass("base-board-board--is-dragging");
            state.active = true;
            if (navigator.vibrate) navigator.vibrate(10);
          }, 350);
        };
        const onMove = (event) => {
          if (!state) return;
          const touch = Array.from(event.touches).find((item) => item.identifier === state.id);
          if (!touch) return;
          state.lastX = touch.clientX;
          state.lastY = touch.clientY;
          if (!state.active) {
            if (Math.hypot(touch.clientX - state.x, touch.clientY - state.y) > 8) clearPending();
            return;
          }
          event.preventDefault();
          if (Math.hypot(touch.clientX - state.x, touch.clientY - state.y) > 8) state.moved = true;
          const target = document.elementFromPoint(touch.clientX, touch.clientY);
          if (!target || !board.contains(target)) return;
          manager.updateAutoScroll(touch.clientX, touch.clientY, target);
          if (Platform.isPhone) edgeScroll(touch.clientY);
          manager.handleCardDragOver({ target, clientX: touch.clientX, clientY: touch.clientY });
        };
        const onEnd = async (event) => {
          if (!state) return;
          window.clearTimeout(timer);
          timer = 0;
          const drag = state;
          state = null;
          stopEdge();
          if (!drag.active) return;
          this.mobileDragClickSuppression = Date.now() + 700;
          // Held without moving: that's a long-press, not a drag. Cancel the
          // drag (card stays put) and show the card's actions instead.
          if (!drag.moved) {
            if (manager.dragType) manager.onDragEnd();
            this.showCardMenu(drag.card, { x: drag.x, y: drag.y });
            return;
          }
          const touch = event.changedTouches && Array.from(event.changedTouches).find((item) => item.identifier === drag.id);
          const x = touch?.clientX ?? drag.lastX;
          const y = touch?.clientY ?? drag.lastY;
          const target = document.elementFromPoint(x, y);
          if (target && board.contains(target)) {
            await manager.handleCardDrop({ target, preventDefault() {} });
          }
          if (manager.dragType) manager.onDragEnd();
        };
        const onCancel = () => {
          stopEdge();
          window.clearTimeout(timer);
          timer = 0;
          state = null;
          if (manager.dragType) manager.onDragEnd();
        };
        board.addEventListener("touchstart", onStart, { passive: true });
        board.addEventListener("touchmove", onMove, { passive: false });
        board.addEventListener("touchend", onEnd, { passive: true });
        board.addEventListener("touchcancel", onCancel, { passive: true });
        manager.__rikkaTouchBoard = board;
        const chipsCleanup = Platform.isPhone ? this.attachColumnChips(board) : null;
        manager.__rikkaTouchCleanup = () => {
          stopEdge();
          chipsCleanup?.();
          window.clearTimeout(timer);
          board.removeEventListener("touchstart", onStart);
          board.removeEventListener("touchmove", onMove);
          board.removeEventListener("touchend", onEnd);
          board.removeEventListener("touchcancel", onCancel);
          manager.__rikkaTouchBoard = null;
          this.mobileBoardCleanups.delete(manager.__rikkaTouchCleanup);
        };
        this.mobileBoardCleanups.add(manager.__rikkaTouchCleanup);
      }
    };
    this.registerEvent(this.app.workspace.on("layout-change", attachTouchDrag));
    this.mobileBoardObserver = new MutationObserver(this.frameThrottle(attachTouchDrag));
    this.mobileBoardObserver.observe(this.app.workspace.containerEl, { childList: true, subtree: true });
    this.register(() => this.mobileBoardObserver?.disconnect());
    attachTouchDrag();
  }

  // Base Board runs inside Obsidian's "bases" view. Find its KanbanView's
  // drag manager by a shallow search of the leaf's view (no private names).
  findBoardDragManager(leaf, board) {
    if (leaf.__rikkaDragManager && leaf.__rikkaDragManager.boardEl === board) return leaf.__rikkaDragManager;
    const seen = new Set();
    let queue = [leaf.view];
    for (let depth = 0; depth < 4 && queue.length; depth++) {
      const next = [];
      for (const obj of queue) {
        if (!obj || typeof obj !== "object" || seen.has(obj) || obj instanceof Node || obj === this.app) continue;
        seen.add(obj);
        const manager = obj.dragDropManager;
        if (manager && typeof manager.handleCardDrop === "function" && manager.boardEl === board) {
          leaf.__rikkaDragManager = manager;
          return manager;
        }
        for (const key of Object.keys(obj)) {
          if (key === "app" || key === "plugin" || key === "workspace") continue;
          let value;
          try { value = obj[key]; } catch (e) { continue; }
          if (value && typeof value === "object" && !(value instanceof Node)) next.push(value);
        }
        if (next.length > 2000) break;
      }
      queue = next;
    }
    return null;
  }

  // Phone: a compact row of column chips ("To do 12") above the stacked board.
  // Tap a chip to jump to that column; the column on screen is highlighted.
  attachColumnChips(board) {
    const host = board.parentElement;
    if (!host) return null;
    host.querySelector(":scope > .rikka-column-chips")?.remove();
    const bar = createDiv({ cls: "rikka-column-chips", attr: { role: "tablist", "aria-label": "Columns" } });
    host.insertBefore(bar, board);
    const columns = () => Array.from(board.querySelectorAll(".base-board-column")).filter((c) => c.dataset.columnName);
    let signature = "";
    const render = () => {
      const list = columns();
      const next = list.map((c) => `${c.dataset.columnName}:${c.querySelectorAll(".base-board-card[data-file-path]").length}`).join("|");
      if (next === signature) return;
      signature = next;
      bar.empty();
      for (const column of list) {
        const name = column.dataset.columnName;
        const chip = bar.createEl("button", { cls: "rikka-column-chip", attr: { type: "button", role: "tab", "data-column": name } });
        chip.createSpan({ cls: "rikka-column-chip-name", text: name });
        chip.createSpan({ cls: "rikka-column-chip-count", text: String(column.querySelectorAll(".base-board-card[data-file-path]").length) });
        chip.addEventListener("click", () => {
          const live = columns().find((c) => c.dataset.columnName === name);
          if (!live) return;
          const top = live.getBoundingClientRect().top - board.getBoundingClientRect().top + board.scrollTop;
          board.scrollTo({ top: Math.max(0, top - 4), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        });
      }
      highlight();
    };
    const highlight = () => {
      const boardTop = board.getBoundingClientRect().top;
      let current = null;
      for (const column of columns()) {
        if (column.getBoundingClientRect().top - boardTop <= 40) current = column.dataset.columnName;
      }
      current ??= columns()[0]?.dataset.columnName;
      bar.querySelectorAll(".rikka-column-chip").forEach((chip) => {
        const on = chip.dataset.column === current;
        chip.toggleClass("is-current", on);
        chip.setAttribute("aria-selected", on ? "true" : "false");
        if (on && (chip.offsetLeft < bar.scrollLeft || chip.offsetLeft + chip.offsetWidth > bar.scrollLeft + bar.clientWidth)) {
          bar.scrollLeft = chip.offsetLeft - 12;
        }
      });
    };
    const onScroll = this.frameThrottle(highlight);
    board.addEventListener("scroll", onScroll, { passive: true });
    const observer = new MutationObserver(this.frameThrottle(render));
    observer.observe(board, { childList: true, subtree: true });
    render();
    return () => { observer.disconnect(); board.removeEventListener("scroll", onScroll); bar.remove(); };
  }

  // Run fn at most once per animation frame (for MutationObserver callbacks).
  frameThrottle(fn) {
    let queued = false;
    return () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(() => { queued = false; fn(); });
    };
  }

  async activateView() {
    const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE);
    const leaf = existing[0] || this.app.workspace.getLeftLeaf(false);
    if (!leaf) return;
    await leaf.setViewState({ type: VIEW_TYPE, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }

  getView() {
    return this.app.workspace.getLeavesOfType(VIEW_TYPE)[0]?.view;
  }

  // Coalesce bursts of vault events (sync, bulk moves) into one Binder render.
  refreshViews() {
    window.clearTimeout(this.renderTimer);
    this.renderTimer = window.setTimeout(() => this.getView()?.render(), 60);
  }

  isInActiveProject(path) {
    return typeof path === "string" && this.pathIsWithin(path, this.activeProject.path);
  }

  runSafely(action, label = "Rikka action") {
    Promise.resolve().then(action).catch((error) => {
      console.error(`${label} failed`, error);
      new Notice(`${label} failed: ${error?.message || error}`);
    });
  }

  async saveState() {
    this.captureActiveProjectState();
    this.stateSaveQueue = this.stateSaveQueue.catch((error) => {
      console.error("Rikka state save failed", error);
    }).then(() => this.saveData(this.data));
    await this.stateSaveQueue;
    this.refreshViews();
  }

  get activeProject() {
    return this.projects.find((project) => project.id === this.data.activeProject) || this.projects[0];
  }

  loadActiveProjectState() {
    const saved = this.data.projectStates[this.data.activeProject] || {};
    const state = Object.assign({}, DEFAULT_DATA, saved);
    state.collapsed = this.asRecord(state.collapsed);
    state.research = this.asPathList(state.research);
    state.trash = this.asPathList(state.trash);
    state.templates = this.asPathList(state.templates);
    state.collections = this.asCollections(state.collections);
    state.context = this.asRecord(state.context);
    for (const key of Object.keys(DEFAULT_DATA)) this.data[key] = state[key];
    // Before the layout is ready the file tree may still be loading (especially
    // on mobile), so only check the folder still exists once it is.
    if (this.app.workspace.layoutReady) this.validateContext();
    else this.data.context = { section: this.data.context.section || "draft", folder: this.data.context.folder || "" };
  }

  captureActiveProjectState() {
    const state = {};
    for (const key of Object.keys(DEFAULT_DATA)) state[key] = this.data[key];
    this.data.projectStates[this.data.activeProject] = state;
  }

  async selectProject(projectId) {
    if (!this.projects.some((project) => project.id === projectId) || projectId === this.data.activeProject) return;
    this.captureActiveProjectState();
    this.data.activeProject = projectId;
    this.loadActiveProjectState();
    this.wordCountCache.clear();
    await this.saveState();
  }

  promptNewProject() {
    new RikkaNameModal(this.app, "New project", "Project name", async (name) => {
      const folderName = this.safeName(name);
      if (!folderName) return;
      const path = folderName;
      if (this.app.vault.getAbstractFileByPath(path)) {
        new Notice("A file or folder with that name already exists in LIFE2.0.");
        return;
      }
      await this.app.vault.createFolder(path);
      const baseId = `project-${folderName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || Date.now().toString(36)}`;
      let id = baseId;
      let suffix = 2;
      while (this.projects.some((project) => project.id === id)) id = `${baseId}-${suffix++}`;
      const project = { id, name: folderName, path };
      this.projects.push(project);
      this.data.projects = this.projects;
      this.data.projectStates[id] = Object.assign({}, DEFAULT_DATA, { collapsed: {}, research: [], trash: [], collections: {}, templates: [], context: { section: "draft", folder: "" } });
      await this.selectProject(id);
      new Notice(`${folderName} is ready in LIFE2.0.`);
    }).open();
  }

  // Project names are labels: renaming one never moves or renames its folder.
  async renameProject(projectId, name) {
    const project = this.projects.find((p) => p.id === projectId);
    const clean = String(name || "").replace(/\s+/g, " ").trim();
    if (!project) throw new Error("Project not found.");
    if (!clean) return "Enter a name.";
    if (this.projects.some((p) => p !== project && p.name.toLowerCase() === clean.toLowerCase())) return `${clean} 2`;
    project.name = clean;
    this.data.projects = this.projects;
    await this.saveState();
  }

  promptRenameProject(projectId = this.data.activeProject) {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) return;
    new RikkaNameModal(this.app, "Rename project", "Project name", (name) => this.renameProject(project.id, name),
      { buttonText: "Rename", initialValue: project.name, subtitle: `Folder: ${project.path} (stays the same)` }).open();
  }

  async setProjectFolder(projectId, path) {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project || !(this.app.vault.getAbstractFileByPath(path) instanceof TFolder)) throw new Error("Folder not found.");
    project.path = path;
    if (projectId === this.data.activeProject) this.data.context = { section: "draft", folder: "" };
    else if (this.data.projectStates[projectId]) this.data.projectStates[projectId].context = { section: "draft", folder: "" };
    this.data.projects = this.projects;
    await this.saveState();
  }

  async removeProject(projectId) {
    if (this.projects.length <= 1) throw new Error("Keep at least one project.");
    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index < 0) return;
    if (projectId === this.data.activeProject) await this.selectProject(this.projects[index === 0 ? 1 : 0].id);
    this.projects.splice(index, 1);
    delete this.data.projectStates[projectId];
    this.data.projects = this.projects;
    await this.saveState();
  }

  async moveProject(projectId, delta) {
    const i = this.projects.findIndex((p) => p.id === projectId);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= this.projects.length) return;
    [this.projects[i], this.projects[j]] = [this.projects[j], this.projects[i]];
    this.data.projects = this.projects;
    await this.saveState();
  }

  get projectRoot() {
    return this.app.vault.getAbstractFileByPath(this.activeProject.path);
  }

  asRecord(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  asPathList(value) {
    return Array.isArray(value) ? [...new Set(value.filter((path) => typeof path === "string" && path.length > 0))] : [];
  }

  asCollections(value) {
    const result = {};
    for (const [name, paths] of Object.entries(this.asRecord(value))) {
      if (typeof name === "string" && name.trim()) result[name] = this.asPathList(paths);
    }
    return result;
  }

  pathIsWithin(path, root) {
    return path === root || path.startsWith(`${root}/`);
  }

  replaceStoredPath(path, oldPath, newPath) {
    return this.pathIsWithin(path, oldPath) ? `${newPath}${path.slice(oldPath.length)}` : path;
  }

  async renameStoredPath(oldPath, newPath) {
    if (!oldPath || !newPath || oldPath === newPath) return;
    const before = JSON.stringify([this.data.research, this.data.trash, this.data.templates, this.data.collections, this.data.collapsed, this.data.context]);
    const migrate = (paths) => [...new Set(paths.map((path) => this.replaceStoredPath(path, oldPath, newPath)))];
    this.data.research = migrate(this.data.research);
    this.data.trash = migrate(this.data.trash);
    this.data.templates = migrate(this.data.templates);
    for (const [name, paths] of Object.entries(this.data.collections)) this.data.collections[name] = migrate(paths);
    const folderPrefixes = ["folder:draft:", "folder:research:", "folder:trash:",
      ...Object.keys(this.data.collections).map((name) => `folder:collection:${name}:`)];
    for (const [key, value] of Object.entries({ ...this.data.collapsed })) {
      const prefix = folderPrefixes.find((candidate) => key.startsWith(candidate));
      if (!prefix) continue;
      const storedPath = key.slice(prefix.length);
      if (this.pathIsWithin(storedPath, oldPath)) {
        const nextKey = `${prefix}${this.replaceStoredPath(storedPath, oldPath, newPath)}`;
        this.data.collapsed[nextKey] = value;
        delete this.data.collapsed[key];
      }
    }
    for (const [path, value] of this.wordCountCache) {
      if (this.pathIsWithin(path, oldPath)) {
        this.wordCountCache.delete(path);
        this.wordCountCache.set(this.replaceStoredPath(path, oldPath, newPath), value);
      }
    }
    const view = this.getView();
    if (view?.selectedPath && this.pathIsWithin(view.selectedPath, oldPath)) view.selectedPath = this.replaceStoredPath(view.selectedPath, oldPath, newPath);
    // Renaming/moving the current folder (here or via sync) keeps it current.
    if (this.data.context?.folder && this.pathIsWithin(this.data.context.folder, oldPath)) {
      this.data.context.folder = this.replaceStoredPath(this.data.context.folder, oldPath, newPath);
    }
    this.validateContext();
    await this.renameSnapshotSources(oldPath, newPath);
    const after = JSON.stringify([this.data.research, this.data.trash, this.data.templates, this.data.collections, this.data.collapsed, this.data.context]);
    if (before !== after) await this.saveState();
  }

  async renameSnapshotSources(oldPath, newPath) {
    if (!this.isInActiveProject(oldPath)) return;
    const prefix = `${this.activeProject.path}/_Rikka/Snapshots/`;
    const snapshots = this.app.vault.getMarkdownFiles().filter((file) => file.path.startsWith(prefix));
    for (const snapshot of snapshots) {
      const content = await this.app.vault.cachedRead(snapshot);
      const match = content.match(/^<!-- Rikka snapshot of (.*?) \|/);
      if (!match || !this.pathIsWithin(match[1], oldPath)) continue;
      const updated = `${content.slice(0, match.index)}<!-- Rikka snapshot of ${this.replaceStoredPath(match[1], oldPath, newPath)} |${content.slice(match.index + match[0].length)}`;
      await this.app.vault.modify(snapshot, updated);
    }
  }

  async removeStoredPath(deletedPath) {
    if (!deletedPath) return;
    const before = JSON.stringify([this.data.research, this.data.trash, this.data.templates, this.data.collections, this.data.collapsed, this.data.context]);
    const remove = (paths) => paths.filter((path) => !this.pathIsWithin(path, deletedPath));
    this.data.research = remove(this.data.research);
    this.data.trash = remove(this.data.trash);
    this.data.templates = remove(this.data.templates);
    for (const name of Object.keys(this.data.collections)) this.data.collections[name] = remove(this.data.collections[name]);
    this.removeCollapsedPath(deletedPath);
    for (const path of this.wordCountCache.keys()) if (this.pathIsWithin(path, deletedPath)) this.wordCountCache.delete(path);
    this.validateContext(); // a deleted current folder falls back to its parent
    const after = JSON.stringify([this.data.research, this.data.trash, this.data.templates, this.data.collections, this.data.collapsed, this.data.context]);
    if (before !== after) await this.saveState();
  }

  removeCollapsedPath(path) {
    const prefixes = ["folder:draft:", "folder:research:", "folder:trash:",
      ...Object.keys(this.data.collections).map((name) => `folder:collection:${name}:`)];
    for (const key of Object.keys(this.data.collapsed)) {
      const prefix = prefixes.find((candidate) => key.startsWith(candidate));
      if (prefix && this.pathIsWithin(key.slice(prefix.length), path)) delete this.data.collapsed[key];
    }
  }

  async toggleCollapsed(key) {
    const defaultValue = key.startsWith("folder:");
    this.data.collapsed[key] = !(this.data.collapsed[key] ?? defaultValue);
    await this.saveState();
  }

  getDraftItems() {
    const root = this.projectRoot;
    if (!(root instanceof TFolder)) return [];
    return root.children
      .filter((item) => !this.isHidden(item.path) && item.name !== "Rikka Trash" && item.name !== "_Rikka")
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
  }

  getVisibleChildren(folder, sectionKey) {
    return folder.children
      .filter((item) => !this.isInOtherCollection(item.path, sectionKey))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
  }

  getCollectionItems(kind) {
    const paths = this.data[kind] || [];
    return paths
      .map((path) => this.app.vault.getAbstractFileByPath(path))
      .filter((item) => item && !paths.some((parentPath) => parentPath !== item.path && item.path.startsWith(`${parentPath}/`)))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
  }

  isHidden(path) {
    const hidden = [...this.data.research, ...this.data.trash];
    return hidden.some((root) => path === root || path.startsWith(`${root}/`));
  }

  isInOtherCollection(path, current) {
    if (current === "research") return this.data.trash.some((root) => path === root || path.startsWith(`${root}/`));
    if (current === "trash") return false;
    return this.isHidden(path);
  }

  iconForFile(file) {
    const custom = this.app.metadataCache.getFileCache(file)?.frontmatter?.rikka_icon;
    if (RIKKA_ICONS.includes(custom)) return custom;
    if (file.extension === "base") return "layout-dashboard";
    if (file.extension === "canvas") return "layout-template";
    return "file-text";
  }

  async openFile(file, newTab = false, split = false) {
    // Open in the main-area tab the user was last working in (not the first
    // tab), even when focus is currently on the Binder in the sidebar.
    const ws = this.app.workspace;
    let target = ws.getMostRecentLeaf?.(ws.rootSplit) || null;
    if (!target || target.getRoot?.() !== ws.rootSplit) {
      ws.iterateRootLeaves((candidate) => { if (!target) target = candidate; });
    }
    const leaf = split
      ? ws.getLeaf("split", "vertical")
      : newTab
        ? ws.getLeaf("tab")
        : target || ws.getLeaf(false);
    await leaf.openFile(file, { active: true });
    if (Platform.isMobile && !newTab && !split) {
      this.app.workspace.setActiveLeaf(leaf, { focus: true });
      this.app.workspace.leftSplit?.collapse();
    }
  }

  async setFileProperty(file, key, value) {
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      if (value !== null && value !== undefined && value !== "") frontmatter[key] = value;
      else delete frontmatter[key];
    });
    this.refreshViews();
  }

  async clearRikkaLabels(file) {
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      delete frontmatter.rikka_status;
      delete frontmatter.rikka_label;
    });
    this.refreshViews();
  }

  async takeSnapshot(file) {
    const projectPath = this.activeProject.path;
    const rikkaPath = `${projectPath}/_Rikka`;
    const folderPath = `${rikkaPath}/Snapshots`;
    const root = this.app.vault.getAbstractFileByPath(rikkaPath);
    if (root && !(root instanceof TFolder)) throw new Error("A file named _Rikka blocks snapshot storage.");
    if (!root) await this.app.vault.createFolder(rikkaPath);
    const folder = this.app.vault.getAbstractFileByPath(folderPath);
    if (folder && !(folder instanceof TFolder)) throw new Error("A file named _Rikka/Snapshots blocks snapshot storage.");
    if (!folder) await this.app.vault.createFolder(folderPath);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const snapshotPath = `${folderPath}/${this.safeName(`${file.basename} — ${stamp}`)}.md`;
    const content = await this.app.vault.cachedRead(file);
    const header = `<!-- Rikka snapshot of ${file.path} | ${new Date().toLocaleString()} -->\n\n`;
    if (this.app.vault.getAbstractFileByPath(snapshotPath)) throw new Error("A snapshot with this timestamp already exists. Try again.");
    await this.app.vault.create(snapshotPath, `${header}${content}`);
    new Notice(`Snapshot saved: ${file.basename}`);
  }

  async openLatestSnapshotBeside(file) {
    const snapshots = this.app.vault.getMarkdownFiles()
      .filter((candidate) => candidate.path.startsWith(`${this.activeProject.path}/_Rikka/Snapshots/`))
      .sort((a, b) => b.stat.mtime - a.stat.mtime);
    let latest = null;
    for (const candidate of snapshots) {
      const text = await this.app.vault.cachedRead(candidate);
      if (text.startsWith(`<!-- Rikka snapshot of ${file.path} |`)) {
        latest = candidate;
        break;
      }
    }
    if (!latest) {
      new Notice("Take a snapshot of this document before comparing versions.");
      return;
    }
    await this.openFile(latest, false, true);
  }

  async getCompileFiles(folder) {
    const results = [];
    const children = [...folder.children].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
    for (const item of children) {
      if (item.path === `${this.activeProject.path}/_Rikka` || this.isHidden(item.path) || (this.data.templates || []).includes(item.path)) continue;
      if (item instanceof TFolder) results.push(...await this.getCompileFiles(item));
      else if (item instanceof TFile && item.extension === "md") {
        if (this.app.metadataCache.getFileCache(item)?.frontmatter?.rikka_include !== false) results.push(item);
      }
    }
    return results;
  }

  async compileDraft() {
    const files = this.projectRoot instanceof TFolder ? await this.getCompileFiles(this.projectRoot) : [];
    if (!files.length) {
      new Notice("There are no Draft documents to compile.");
      return;
    }
    const sections = [];
    for (const file of files) {
      const source = await this.app.vault.cachedRead(file);
      const body = this.stripFrontmatter(source).trim();
      const heading = file.path.replace(/\.md$/i, "");
      sections.push(`# ${heading}\n\n${body}`);
    }
    const rikkaPath = `${this.activeProject.path}/_Rikka`;
    const outputFolder = `${rikkaPath}/Exports`;
    const rikkaRoot = this.app.vault.getAbstractFileByPath(rikkaPath);
    if (rikkaRoot && !(rikkaRoot instanceof TFolder)) {
      new Notice("Cannot compile: a file named _Rikka blocks the export folder.");
      return;
    }
    if (!rikkaRoot) await this.app.vault.createFolder(rikkaPath);
    const exportFolder = this.app.vault.getAbstractFileByPath(outputFolder);
    if (exportFolder && !(exportFolder instanceof TFolder)) {
      new Notice("Cannot compile: a file named _Rikka/Exports blocks the export folder.");
      return;
    }
    if (!exportFolder) await this.app.vault.createFolder(outputFolder);
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const outputPath = `${outputFolder}/${this.activeProject.name} — Draft ${stamp}.md`;
    const compiled = `# ${this.activeProject.name} — Draft\n\n${sections.join("\n\n---\n\n")}\n`;
    await this.app.vault.create(outputPath, compiled);
    new Notice(`Compiled ${files.length} documents to Markdown.`);
  }

  async getDraftWordCount() {
    let total = 0;
    const templatePaths = new Set(this.data.templates || []);
    for (const file of this.app.vault.getMarkdownFiles()) {
      if (!this.pathIsWithin(file.path, this.activeProject.path) || this.pathIsWithin(file.path, `${this.activeProject.path}/_Rikka`) || this.isHidden(file.path) || templatePaths.has(file.path)) continue;
      const cached = this.wordCountCache.get(file.path);
      if (cached?.mtime === file.stat.mtime) {
        total += cached.words;
        continue;
      }
      const text = await this.app.vault.cachedRead(file);
      const body = this.stripFrontmatter(text);
      const words = (body.match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu) || []).length;
      this.wordCountCache.set(file.path, { mtime: file.stat.mtime, words });
      total += words;
    }
    return total;
  }

  stripFrontmatter(text) {
    return String(text).replace(/^\uFEFF/, "").replace(/^---[ \t]*\r?\n[\s\S]*?^---[ \t]*(?:\r?\n|$)/m, "");
  }

  async updateWordCounts() {
    const view = this.getView();
    const container = view?.containerEl.querySelector(".rikka-location-words");
    if (!container) return;
    await this.renderDraftWordCount(container);
    view.containerEl.querySelectorAll(".rikka-note-row").forEach((row) => {
      const count = this.wordCountCache.get(row.dataset.path)?.words;
      const badge = row.querySelector(".rikka-row-wordcount");
      if (badge && Number.isFinite(count)) badge.setText(`${count.toLocaleString()}w`);
    });
  }

  async renderDraftWordCount(container) {
    container.empty();
    const words = await this.getDraftWordCount();
    const binder = container.closest(".rikka-binder");
    binder?.querySelectorAll(".rikka-note-row").forEach((row) => {
      const count = this.wordCountCache.get(row.dataset.path)?.words;
      if (!Number.isFinite(count) || row.querySelector(".rikka-row-wordcount")) return;
      row.createSpan({ cls: "rikka-row-wordcount", text: `${count.toLocaleString()}w` });
    });
    void words; // total draft word count is intentionally not shown
  }

  promptNewFromTemplate() {
    const templates = (this.data.templates || [])
      .map((path) => this.app.vault.getAbstractFileByPath(path))
      .filter((file) => file instanceof TFile);
    if (!templates.length) {
      new Notice("Right-click a document and choose Save as template first.");
      return;
    }
    const info = this.resolveCreateTarget();
    const choices = templates.map((file) => ({ value: file.path, label: file.basename }));
    new RikkaChoiceModal(this.app, `Template for a new document in ${info.name}`, choices, async (path) => {
      const template = this.app.vault.getAbstractFileByPath(path);
      if (!(template instanceof TFile)) return;
      new RikkaNameModal(this.app, `New document in ${info.name}`, "Document title", async (name) => {
        const safe = this.safeName(name);
        if (!safe) return false;
        const targetPath = `${info.targetPath}/${safe}.md`;
        if (this.app.vault.getAbstractFileByPath(targetPath)) {
          return this.availablePath(info.targetPath, safe, "md").split("/").pop().replace(/\.md$/, "");
        }
        const content = await this.app.vault.cachedRead(template);
        const created = await this.app.vault.create(targetPath, content);
        await this.registerInSection(info, created.path);
        await this.saveState();
        await this.openFile(created);
      }, { subtitle: `${info.path} · from “${template.basename}”`, draftKey: `template:${info.targetPath}` }).open();
    }).open();
  }

  promptNewCollection(file = null) {
    new RikkaNameModal(this.app, "New collection", "Collection name", async (name) => {
      const cleanName = name.trim();
      if (!cleanName) return;
      if (Object.keys(this.data.collections).some((existing) => existing.toLowerCase() === cleanName.toLowerCase())) {
        new Notice("A collection with that name already exists.");
        return;
      }
      this.data.collections[cleanName] = file ? [file.path] : [];
      await this.saveState();
    }).open();
  }

  addToCollection(file) {
    const names = Object.keys(this.data.collections || {}).sort((a, b) => a.localeCompare(b));
    if (!names.length) {
      this.promptNewCollection(file);
      return;
    }
    const choices = [...names.map((name) => ({ value: name, label: name })), { value: "__new__", label: "Create new collection…" }];
    new RikkaChoiceModal(this.app, `Add to collection · ${file.basename}`, choices, async (name) => {
      if (name === "__new__") {
        this.promptNewCollection(file);
        return;
      }
      const paths = this.data.collections[name] || [];
      if (!paths.includes(file.path)) this.data.collections[name] = [...paths, file.path];
      await this.saveState();
    }).open();
  }

  async removeFromCollection(name, path) {
    this.data.collections[name] = (this.data.collections[name] || []).filter((item) => item !== path);
    await this.saveState();
  }

  showCollectionMenu(name, event) {
    const menu = new Menu();
    menu.addItem((entry) => entry.setTitle("New collection").setIcon("library").onClick(() => this.promptNewCollection()));
    menu.addItem((entry) => entry.setTitle("Delete collection").setIcon("trash-2").onClick(() => this.runSafely(async () => {
      delete this.data.collections[name];
      delete this.data.collapsed[`collection:${name}`];
      for (const key of Object.keys(this.data.collapsed)) if (key.startsWith(`folder:collection:${name}:`)) delete this.data.collapsed[key];
      await this.saveState();
    }, "Delete collection")));
    menu.showAtMouseEvent(event);
  }

  async openFolder(folder) {
    const file = this.app.vault.getAbstractFileByPath(folder.path);
    if (file instanceof TFolder) this.refreshViews();
  }

  // ---- Updates: check quietly, install only when the user taps the button ----
  // Rikka quietly checks GitHub (on launch and when returning to Obsidian, at
  // most every 30 minutes). If a newer release exists, an "Update Rikka"
  // button appears in the Binder. Nothing is installed until it is tapped.
  installUpdateChecker() {
    // No background checks: updating only happens from the button in
    // Settings → Rikka (or the "Update Rikka" command).
    this.availableUpdate = null;
    this.addCommand({ id: "update-rikka", name: "Update Rikka", icon: "download", callback: () => this.installUpdate(true) });
    this.addSettingTab(new RikkaSettingTab(this.app, this));
    this.installGeneralUpdateRow();
  }

  // Settings → General: an "Update Rikka" row right under Obsidian's own
  // version / "Check for updates" row. Only acts when the button is pressed.
  installGeneralUpdateRow() {
    const addRow = () => {
      const setting = this.app.setting;
      const content = setting?.activeTab?.containerEl;
      if (!content || !content.isConnected) return;
      // General ("about") tab: its first row is Obsidian's version + Check for updates.
      if (setting.activeTab.id !== "about" && !/^Version\s/.test(content.querySelector(".setting-item-name")?.textContent || "")) return;
      if (!content || content.querySelector(".rikka-general-update")) return;
      const first = content.querySelector(".setting-item");
      if (!first) return;
      const row = content.ownerDocument.createElement("div");
      row.className = "setting-item rikka-general-update";
      const info = row.createDiv({ cls: "setting-item-info" });
      info.createDiv({ cls: "setting-item-name", text: "Rikka" });
      const desc = info.createDiv({ cls: "setting-item-description", text: `Current version: ${this.manifest.version}` });
      void this.installedVersion().then((v) => desc.setText(`Current version: ${v}`));
      const control = row.createDiv({ cls: "setting-item-control" });
      const button = control.createEl("button", { text: "Update Rikka" });
      button.addEventListener("click", async () => {
        button.disabled = true;
        button.setText("Checking…");
        try { await this.installUpdate(true); } finally {
          button.disabled = false;
          button.setText("Update Rikka");
          desc.setText(`Current version: ${await this.installedVersion()}`);
        }
      });
      first.after(row);
    };
    // Settings can finish switching tabs after the DOM change we hear about,
    // so re-check a few times over the next second.
    let timers = [];
    const schedule = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers = [0, 100, 300, 700, 1200].map((ms) => window.setTimeout(addRow, ms));
    };
    const observer = new MutationObserver(this.frameThrottle(schedule));
    observer.observe(document.body, { childList: true, subtree: true });
    this.registerDomEvent(document, "click", schedule, true);
    // Safety net: a cheap check while the app runs (does nothing unless the
    // General settings page is open and missing the row).
    // Settings may open in its own window (a different document), so check
    // Obsidian's settings object directly rather than the main window's DOM.
    this.registerInterval(window.setInterval(addRow, 500));
    this.register(() => {
      observer.disconnect();
      timers.forEach((t) => window.clearTimeout(t));
      document.querySelectorAll(".rikka-general-update").forEach((el) => el.remove());
      this.app.setting?.activeTab?.containerEl?.querySelectorAll?.(".rikka-general-update").forEach((el) => el.remove());
    });
  }

  // The version actually installed on disk (Obsidian keeps the version it
  // loaded at startup in memory, which goes stale after an update).
  async installedVersion() {
    try {
      const dir = this.manifest.dir || `${this.app.vault.configDir}/plugins/${this.manifest.id}`;
      return JSON.parse(await this.app.vault.adapter.read(`${dir}/manifest.json`)).version || this.manifest.version;
    } catch (error) {
      return this.manifest.version;
    }
  }

  isNewer(a, b) {
    const pa = String(a).split(".").map(Number);
    const pb = String(b).split(".").map(Number);
    for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
      if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0);
    }
    return false;
  }

  async findUpdate(force = false) {
    const now = Date.now();
    if (!force && this.lastUpdateCheck && now - this.lastUpdateCheck < 30 * 60 * 1000) return this.availableUpdate;
    this.lastUpdateCheck = now;
    try {
      const { requestUrl } = require("obsidian");
      const release = (await requestUrl({ url: "https://api.github.com/repos/Ramirikka/obsidian-rikka/releases/latest", headers: { Accept: "application/vnd.github+json" } })).json;
      const asset = (name) => release?.assets?.find((a) => a.name === name)?.browser_download_url;
      const version = String(release?.tag_name || "").replace(/^v/, "");
      const installed = await this.installedVersion();
      const ready = asset("manifest.json") && asset("main.js");
      this.availableUpdate = ready && this.isNewer(version, installed)
        ? { version, manifest: asset("manifest.json"), main: asset("main.js"), styles: asset("styles.css") }
        : null;
    } catch (error) {
      this.lastUpdateCheck = 0;
      console.warn("Rikka update check failed", error);
    }
    return this.availableUpdate;
  }

  async installUpdate(fromCommand = false) {
    if (this.installingUpdate) return;
    this.installingUpdate = true;
    try {
      const update = await this.findUpdate(true);
      if (!update) {
        if (fromCommand) new Notice(`Rikka is up to date (${await this.installedVersion()}).`);
        return;
      }
      const { requestUrl } = require("obsidian");
      const remote = (await requestUrl({ url: update.manifest })).json;
      if (remote?.id !== this.manifest.id || remote.version !== update.version) throw new Error("Release files don't match");
      const js = (await requestUrl({ url: update.main })).text;
      if (!js || js.length < 10000 || !js.includes("RikkaPlugin")) throw new Error("Downloaded update looks incomplete");
      const css = update.styles ? await requestUrl({ url: update.styles }).then((r) => r.text, () => null) : null;
      const dir = this.manifest.dir || `${this.app.vault.configDir}/plugins/${this.manifest.id}`;
      const adapter = this.app.vault.adapter;
      await adapter.write(`${dir}/main.js`, js);
      if (css) await adapter.write(`${dir}/styles.css`, css);
      await adapter.write(`${dir}/manifest.json`, JSON.stringify(remote, null, 2));
      // Keep Obsidian's in-memory copy in step so the new version is recognised.
      if (this.app.plugins?.manifests?.[this.manifest.id]) this.app.plugins.manifests[this.manifest.id].version = remote.version;
      this.availableUpdate = null;
      new Notice(`Rikka updated to ${remote.version}.`);
      const id = this.manifest.id;
      const plugins = this.app.plugins;
      window.setTimeout(async () => {
        await plugins.disablePlugin(id);
        await plugins.enablePlugin(id);
      }, 300);
    } catch (error) {
      console.error("Rikka update failed", error);
      new Notice(`Couldn't update Rikka: ${error?.message || error}`);
    } finally {
      this.installingUpdate = false;
    }
  }

  // ---- Editor features -----------------------------------------------------

  installEditorFeatures() {
    this.slashSuggest = new RikkaSlashSuggest(this);
    this.registerEditorSuggest(this.slashSuggest);
    this.registerEditorSuggest(new RikkaMentionSuggest(this));

    // Paste a URL over selected text => [text](url). Only when the selection is
    // plain text on one line and the clipboard is exactly one URL.
    this.registerEvent(this.app.workspace.on("editor-paste", (event, editor) => {
      if (event.defaultPrevented) return;
      const selection = editor.getSelection();
      const pasted = event.clipboardData?.getData("text/plain")?.trim() || "";
      if (!selection || selection.includes("\n") || /^\s*$/.test(selection)) return;
      if (!/^(https?:\/\/|obsidian:\/\/|mailto:)[^\s]+$/i.test(pasted)) return;
      if (/^\[.*\]\(.*\)$/.test(selection) || /^https?:\/\//i.test(selection)) return;
      const cursor = editor.getCursor("from");
      if (rikkaInCodeContext(editor, cursor.line, cursor.ch)) return;
      event.preventDefault();
      editor.replaceSelection(`[${selection.replace(/([\[\]])/g, "\\$1")}](${pasted.replace(/\)/g, "%29")})`);
    }));

    // "[] " or "[ ] " at the start of a line => "- [ ] " (task). Other Markdown
    // shortcuts (#, -, 1., >) are native to Obsidian and left untouched.
    this.registerEvent(this.app.workspace.on("editor-change", (editor) => {
      const cursor = editor.getCursor();
      const before = editor.getLine(cursor.line).slice(0, cursor.ch);
      const match = before.match(/^(\s*)\[ ?\] $/);
      if (!match || rikkaInCodeContext(editor, cursor.line, 0)) return;
      editor.transaction({
        changes: [{ from: { line: cursor.line, ch: 0 }, to: cursor, text: `${match[1]}- [ ] ` }],
        selection: { from: { line: cursor.line, ch: match[1].length + 6 } },
      });
    }));

    // Passive selection word count in the status bar (desktop).
    if (!Platform.isMobile) {
      const status = this.addStatusBarItem();
      status.addClass("rikka-selection-count");
      let timer = 0;
      const update = () => {
        const editor = this.app.workspace.activeEditor?.editor;
        const text = editor?.getSelection() || "";
        if (!text.trim()) { status.setText(""); status.hide(); return; }
        const words = (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’_-]*/gu) || []).length;
        status.setText(`${words.toLocaleString()} ${words === 1 ? "word" : "words"} · ${text.length.toLocaleString()} characters selected`);
        status.show();
      };
      status.hide();
      this.registerDomEvent(document, "selectionchange", () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(update, 120);
      });
    }

    // Commands (assignable hotkeys; addable to the mobile toolbar in
    // Settings → Mobile). No default hotkeys, so nothing native is hijacked.
    const edit = (id, name, icon, fn) => this.addCommand({ id, name, icon, editorCallback: (editor, ctx) => fn(editor, ctx) });
    const cursorRange = (editor) => { const c = editor.getCursor(); return { from: c, to: c }; };
    edit("block-text", "Turn into text", "pilcrow", (e) => this.setLineKind(e, cursorRange(e), "text"));
    edit("block-h1", "Turn into heading 1", "heading-1", (e) => this.setLineKind(e, cursorRange(e), "h1"));
    edit("block-h2", "Turn into heading 2", "heading-2", (e) => this.setLineKind(e, cursorRange(e), "h2"));
    edit("block-h3", "Turn into heading 3", "heading-3", (e) => this.setLineKind(e, cursorRange(e), "h3"));
    edit("block-todo", "Turn into to-do", "check-square", (e) => this.setLineKind(e, cursorRange(e), "todo"));
    edit("block-bullet", "Turn into bullet list", "list", (e) => this.setLineKind(e, cursorRange(e), "bullet"));
    edit("block-numbered", "Turn into numbered list", "list-ordered", (e) => this.setLineKind(e, cursorRange(e), "numbered"));
    edit("block-quote", "Turn into quote", "quote", (e) => this.setLineKind(e, cursorRange(e), "quote"));
    edit("block-code", "Insert code block", "code-2", (e) => this.insertBlock(e, cursorRange(e), "```\n", "\n```", ""));
    edit("block-duplicate", "Duplicate block", "copy", (e) => this.duplicateBlock(e));
    edit("block-delete", "Delete block", "trash", (e) => this.deleteBlock(e));
    edit("block-move-up", "Move block up", "arrow-up", (e) => this.moveBlock(e, -1));
    edit("block-move-down", "Move block down", "arrow-down", (e) => this.moveBlock(e, 1));
    edit("toggle-strikethrough", "Toggle strikethrough", "strikethrough", (e) => this.toggleWrap(e, "~~", "~~"));
    edit("toggle-underline", "Toggle underline", "underline", (e) => this.toggleWrap(e, "<u>", "</u>"));
    edit("toggle-inline-code", "Toggle inline code", "code", (e) => this.toggleWrap(e, "`", "`"));
    edit("insert-link", "Insert link to note", "link", (e) => { const c = e.getCursor(); e.transaction({ changes: [{ from: c, to: c, text: "[[" }], selection: { from: { line: c.line, ch: c.ch + 2 } } }); });
    edit("open-slash-menu", "Open insert menu (/)", "plus-circle", (e) => {
      const c = e.getCursor();
      const before = e.getLine(c.line).slice(0, c.ch);
      const text = before === "" || /\s$/.test(before) ? "/" : " /";
      e.transaction({ changes: [{ from: c, to: c, text }], selection: { from: { line: c.line, ch: c.ch + text.length } } });
    });
    edit("indent", "Indent list item", "indent", (e) => this.shiftIndent(e, 1));
    edit("outdent", "Outdent list item", "outdent", (e) => this.shiftIndent(e, -1));
  }

  // All "/" commands. Groups appear in this order when the menu first opens.
  slashCommands() {
    if (this._slashCommands) return this._slashCommands;
    const line = (kind) => ({ editor, from, to }) => this.setLineKind(editor, { from, to }, kind);
    const block = (open, close = "", middle = "") => ({ editor, from, to }) => this.insertBlock(editor, { from, to }, open, close, middle);
    const attach = (accept, embed) => ({ editor, from, to, file }) => this.pickAttachment(editor, { from, to }, file, accept, embed);
    const groups = [
      ["Basic", [
        ["Text", "pilcrow", "Plain paragraph", ["text", "plain", "paragraph", "p"], line("text")],
        ["Heading 1", "heading-1", "Large section heading", ["h1", "heading1", "#", "title"], line("h1")],
        ["Heading 2", "heading-2", "Medium section heading", ["h2", "heading2", "##", "subtitle"], line("h2")],
        ["Heading 3", "heading-3", "Small section heading", ["h3", "heading3", "###"], line("h3")],
        ["Bullet list", "list", "Simple bulleted list", ["bullet", "bullets", "unordered", "list", "ul"], line("bullet")],
        ["Numbered list", "list-ordered", "List with numbers", ["num", "number", "numbered", "ordered", "ol"], line("numbered")],
        ["To-do", "check-square", "Track a task", ["todo", "task", "checkbox", "check"], line("todo")],
        ["Toggle", "chevron-right", "Collapsible section (folded callout)", ["toggle", "collapse", "fold", "details"], block("> [!note]- ", "\n> ", "Title")],
        ["Quote", "quote", "Capture a quote", ["quote", "blockquote", "cite"], line("quote")],
        ["Divider", "minus", "Visually separate sections", ["divider", "div", "line", "hr", "separator", "---"], ({ editor, from, to }) => this.insertDivider(editor, { from, to })],
      ]],
      ["Insert", [
        ["Page", "file-plus-2", "New page here, linked", ["page", "new", "document", "doc", "note"], ({ editor, from, to, file }) => this.slashNewPage(editor, { from, to }, file)],
        ["Link to page", "link", "Link an existing note", ["link", "wikilink", "mention", "[["], ({ editor, from, to }) => editor.transaction({ changes: [{ from, to, text: "[[" }], selection: { from: { line: from.line, ch: from.ch + 2 } } })],
        ["Image", "image", "Photo, camera or image file", ["image", "img", "photo", "picture", "camera"], attach("image/*", true)],
        ["File", "paperclip", "Attach any file", ["file", "attach", "attachment", "upload"], attach("*/*", false)],
        ["PDF", "file-text", "Embed a PDF", ["pdf", "document"], attach("application/pdf,.pdf", true)],
        ["Video", "video", "Embed a video file", ["video", "movie", "mp4"], attach("video/*", true)],
        ["Audio", "music", "Embed an audio file", ["audio", "sound", "voice", "mp3"], attach("audio/*", true)],
        ["Bookmark", "bookmark", "Link to a web page", ["book", "bookmark", "web", "url"], ({ editor, from, to }) => this.slashBookmark(editor, { from, to }, false)],
        ["Embed", "monitor-play", "Embed a web page, video or image URL", ["embed", "iframe", "youtube"], ({ editor, from, to }) => this.slashBookmark(editor, { from, to }, true)],
        ["Table", "table", "Simple Markdown table", ["table", "grid"], block("| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| ", " |  |  |\n|  |  |  |", "")],
        ["Code", "code-2", "Code block", ["code", "snippet", "```"], block("```", "\n\n```", "")],
        ["Callout", "message-square", "Highlighted note, tip or warning", ["callout", "admonition", "note", "warning", "tip", "info"], ({ editor, from, to }) => this.slashCallout(editor, { from, to })],
        ["Equation", "sigma", "Math block (LaTeX)", ["equation", "math", "latex", "formula", "$$"], block("$$\n", "\n$$", "")],
      ]],
      ["Project", [
        ["Kanban board", "kanban-square", "Create a new board", ["kanban", "board", "kan", "base"], ({ editor, from, to }) => this.slashKanban(editor, { from, to })],
      ]],
      ["Structure", [
        ["Table of contents", "list-tree", "Open the live outline of this page", ["toc", "contents", "outline"], ({ editor, from, to }) => { this.removeRange(editor, from, to); this.app.commands?.executeCommandById("outline:open"); }],
        ["Breadcrumb", "map-pin", "Show where this page lives", ["bread", "breadcrumb", "breadcrumbs", "location", "path"], ({ editor, from, to, file }) => this.slashBreadcrumb(editor, { from, to }, file)],
      ]],
      ["Utility", [
        ["Date", "calendar", "Today's date", ["date", "today"], ({ editor, from, to }) => this.replaceAndPlace(editor, from, to, window.moment().format("YYYY-MM-DD"))],
        ["Time", "clock", "Current time", ["time", "now", "clock"], ({ editor, from, to }) => this.replaceAndPlace(editor, from, to, window.moment().format("HH:mm"))],
        ["Emoji", "smile", "Insert an emoji", ["emoji", "emoticon", "smiley"], ({ editor, from, to }) => this.slashEmoji(editor, { from, to })],
        ["Duplicate", "copy", "Duplicate this block", ["duplicate", "dup", "copy"], ({ editor, from, to }) => { this.removeRange(editor, from, to); this.duplicateBlock(editor); }],
        ["Move to", "corner-down-right", "Move this block under a heading", ["moveto", "move", "mv"], ({ editor, from, to }) => { this.removeRange(editor, from, to); this.moveBlockToHeading(editor); }],
        ["Delete", "trash-2", "Delete this block", ["delete", "del", "remove"], ({ editor, from, to }) => { this.removeRange(editor, from, to); this.deleteBlock(editor); }],
      ]],
    ];
    const items = [];
    for (const [group, entries] of groups) {
      entries.forEach(([title, icon, description, aliases, run], i) => items.push({ group, firstInGroup: i === 0, title, icon, description, aliases, run }));
    }
    this._slashCommands = items;
    return items;
  }

  removeRange(editor, from, to) {
    editor.transaction({ changes: [{ from, to, text: "" }], selection: { from } });
  }

  replaceAndPlace(editor, from, to, text) {
    editor.transaction({ changes: [{ from, to, text }], selection: { from: { line: from.line, ch: from.ch + text.length } } });
  }

  // Turn the current line into a kind of block, removing the typed "/query"
  // in the same transaction (one undo step).
  setLineKind(editor, { from, to }, kind) {
    const lineNo = from.line;
    const original = editor.getLine(lineNo);
    let text = original.slice(0, from.ch) + original.slice(to.ch);
    let caretInText = from.ch;
    // "Hello /h1" -> "# Hello" (drop the space that preceded the command).
    if (to.ch === original.length && / $/.test(original.slice(0, from.ch)) && text.trim()) {
      text = text.replace(/ +$/, "");
      caretInText = text.length;
    }
    const match = text.match(RIKKA_PREFIX_RE);
    const indent = match[1] || "";
    const oldPrefixLength = match[0].length;
    const content = text.slice(oldPrefixLength);
    const prefix = {
      text: indent,
      h1: "# ", h2: "## ", h3: "### ",
      bullet: `${indent}- `,
      numbered: `${indent}1. `,
      todo: `${indent}- [ ] `,
      quote: `${indent}> `,
    }[kind] ?? indent;
    const next = prefix + content;
    const ch = Math.max(prefix.length, Math.min(next.length, prefix.length + (caretInText - oldPrefixLength)));
    editor.transaction({
      changes: [{ from: { line: lineNo, ch: 0 }, to: { line: lineNo, ch: original.length }, text: next }],
      selection: { from: { line: lineNo, ch } },
    });
  }

  // Insert a multi-line block. If the line is otherwise empty the block takes
  // its place; otherwise it goes on the lines below. Caret lands at `middle`.
  insertBlock(editor, { from, to }, open, close, middle) {
    const lineNo = from.line;
    const original = editor.getLine(lineNo);
    const rest = (original.slice(0, from.ch) + original.slice(to.ch));
    const emptyLine = rest.trim() === "";
    const lead = emptyLine ? "" : `${rest}\n`;
    const textBefore = lead + open;
    const full = textBefore + middle + close;
    const caretLines = textBefore.split("\n");
    const caretLine = lineNo + caretLines.length - 1;
    const caretCh = caretLines[caretLines.length - 1].length;
    editor.transaction({
      changes: [{ from: { line: lineNo, ch: 0 }, to: { line: lineNo, ch: original.length }, text: full }],
      selection: middle
        ? { from: { line: caretLine, ch: caretCh }, to: { line: caretLine, ch: caretCh + middle.length } }
        : { from: { line: caretLine, ch: caretCh } },
    });
  }

  insertDivider(editor, { from, to }) {
    const lineNo = from.line;
    const original = editor.getLine(lineNo);
    const rest = original.slice(0, from.ch) + original.slice(to.ch);
    // A blank line before "---" stops it turning the previous line into a heading.
    const above = lineNo > 0 ? editor.getLine(lineNo - 1) : "";
    const parts = [];
    if (rest.trim()) parts.push(rest, "");
    else if (above.trim()) parts.push("");
    parts.push("---", "");
    const text = parts.join("\n");
    const lastLine = lineNo + parts.length - 1;
    editor.transaction({
      changes: [{ from: { line: lineNo, ch: 0 }, to: { line: lineNo, ch: original.length }, text }],
      selection: { from: { line: lastLine, ch: 0 } },
    });
  }

  toggleWrap(editor, open, close) {
    const selection = editor.getSelection();
    if (selection.startsWith(open) && selection.endsWith(close) && selection.length >= open.length + close.length) {
      editor.replaceSelection(selection.slice(open.length, selection.length - close.length));
      return;
    }
    const from = editor.getCursor("from");
    editor.transaction({
      changes: [{ from, to: editor.getCursor("to"), text: `${open}${selection}${close}` }],
      selection: selection
        ? { from: { line: from.line, ch: from.ch + open.length }, to: { line: from.line, ch: from.ch + open.length + selection.length } }
        : { from: { line: from.line, ch: from.ch + open.length } },
    });
  }

  shiftIndent(editor, direction) {
    const from = editor.getCursor("from").line;
    const to = editor.getCursor("to").line;
    const unit = this.app.vault.getConfig?.("useTab") === false ? " ".repeat(this.app.vault.getConfig?.("tabSize") || 4) : "\t";
    const changes = [];
    for (let line = from; line <= to; line++) {
      const text = editor.getLine(line);
      if (direction > 0) changes.push({ from: { line, ch: 0 }, to: { line, ch: 0 }, text: unit });
      else {
        const lead = text.match(/^(\t| {1,4})/)?.[0];
        if (lead) changes.push({ from: { line, ch: 0 }, to: { line, ch: lead.length }, text: "" });
      }
    }
    if (changes.length) editor.transaction({ changes });
  }

  // A logical block in plain Markdown: a fenced code block, a list item with
  // its nested children, a heading line, a table, or a paragraph/quote/callout
  // (contiguous non-blank lines). Returns inclusive line numbers.
  getBlockRange(editor, lineNo) {
    const last = editor.lastLine();
    const get = (i) => editor.getLine(i);
    // Inside a fenced code block? The whole fence is the block.
    let open = -1;
    for (let i = 0; i <= last; i++) {
      if (!/^\s*(```|~~~)/.test(get(i))) continue;
      if (open < 0) { open = i; if (i > lineNo) break; }
      else { if (lineNo >= open && lineNo <= i) return { start: open, end: i }; open = -1; if (i > lineNo) break; }
    }
    const text = get(lineNo);
    if (!text.trim()) return { start: lineNo, end: lineNo };
    if (/^#{1,6}\s/.test(text)) return { start: lineNo, end: lineNo };
    const listItem = text.match(/^(\s*)([-*+]|\d+[.)])\s/);
    if (listItem) {
      const indent = listItem[1].replace(/\t/g, "    ").length;
      let end = lineNo;
      for (let i = lineNo + 1; i <= last; i++) {
        const t = get(i);
        if (!t.trim()) break;
        const ind = t.match(/^\s*/)[0].replace(/\t/g, "    ").length;
        if (ind > indent) end = i; else break;
      }
      return { start: lineNo, end };
    }
    let start = lineNo;
    let end = lineNo;
    const sameKind = (t) => t.trim() && !/^#{1,6}\s/.test(t) && !/^\s*([-*+]|\d+[.)])\s/.test(t) && !/^\s*(```|~~~)/.test(t);
    while (start > 0 && sameKind(get(start - 1))) start--;
    while (end < last && sameKind(get(end + 1))) end++;
    return { start, end };
  }

  blockText(editor, { start, end }) {
    const lines = [];
    for (let i = start; i <= end; i++) lines.push(editor.getLine(i));
    return lines.join("\n");
  }

  duplicateBlock(editor) {
    const selection = editor.getSelection();
    if (selection) {
      const to = editor.getCursor("to");
      editor.transaction({ changes: [{ from: to, to, text: selection }] });
      return;
    }
    const range = this.getBlockRange(editor, editor.getCursor().line);
    const text = this.blockText(editor, range);
    const endCh = editor.getLine(range.end).length;
    editor.transaction({
      changes: [{ from: { line: range.end, ch: endCh }, to: { line: range.end, ch: endCh }, text: `\n${text}` }],
      selection: { from: { line: range.end + 1 + (editor.getCursor().line - range.start), ch: editor.getCursor().ch } },
    });
  }

  deleteBlock(editor) {
    if (editor.getSelection()) { editor.replaceSelection(""); return; }
    const range = this.getBlockRange(editor, editor.getCursor().line);
    const last = editor.lastLine();
    // Never empty the whole document by accident: one block at a time.
    const from = range.end < last ? { line: range.start, ch: 0 } : range.start > 0 ? { line: range.start - 1, ch: editor.getLine(range.start - 1).length } : { line: range.start, ch: 0 };
    const to = range.end < last ? { line: range.end + 1, ch: 0 } : { line: range.end, ch: editor.getLine(range.end).length };
    editor.transaction({ changes: [{ from, to, text: "" }], selection: { from: { line: Math.min(range.start, Math.max(0, editor.lastLine() - (range.end - range.start + 1))), ch: 0 } } });
  }

  // Swap the current block with the next/previous block, skipping blank
  // lines and keeping the spacing between them exactly as it was.
  moveBlock(editor, direction) {
    const cursor = editor.getCursor();
    const range = this.getBlockRange(editor, cursor.line);
    const last = editor.lastLine();
    let probe = direction < 0 ? range.start - 1 : range.end + 1;
    while (probe >= 0 && probe <= last && !editor.getLine(probe).trim()) probe += direction;
    if (probe < 0 || probe > last) return;
    const neighbour = this.getBlockRange(editor, probe);
    const first = direction < 0 ? neighbour : range;
    const second = direction < 0 ? range : neighbour;
    const sep = [];
    for (let i = first.end + 1; i < second.start; i++) sep.push(editor.getLine(i));
    const joined = [this.blockText(editor, second), ...sep, this.blockText(editor, first)].join("\n");
    const offset = cursor.line - range.start;
    const secondLen = second.end - second.start + 1;
    const newStart = direction < 0 ? first.start : first.start + secondLen + sep.length;
    editor.transaction({
      changes: [{ from: { line: first.start, ch: 0 }, to: { line: second.end, ch: editor.getLine(second.end).length }, text: joined }],
      selection: { from: { line: newStart + offset, ch: cursor.ch } },
    });
  }

  moveBlockToHeading(editor) {
    const cursor = editor.getCursor();
    const range = this.getBlockRange(editor, cursor.line);
    const headings = [];
    for (let i = 0; i <= editor.lastLine(); i++) {
      const m = editor.getLine(i).match(/^(#{1,6})\s+(.*)$/);
      if (m && (i < range.start || i > range.end)) headings.push({ line: i, level: m[1].length, title: m[2] });
    }
    if (!headings.length) { new Notice("Add a heading first, then move blocks under it."); return; }
    const choices = headings.map((h) => ({ value: h, label: `${"  ".repeat(h.level - 1)}${h.title}` }));
    new RikkaChoiceModal(this.app, "Move block under heading…", choices, (heading) => {
      // End of that heading's section: next heading of same or higher level.
      let target = editor.lastLine();
      for (let i = heading.line + 1; i <= editor.lastLine(); i++) {
        const m = editor.getLine(i).match(/^(#{1,6})\s/);
        if (m && m[1].length <= heading.level) { target = i - 1; break; }
      }
      while (target > heading.line && !editor.getLine(target).trim()) target--;
      const text = this.blockText(editor, range);
      const removeFrom = { line: range.start, ch: 0 };
      const removeTo = range.end < editor.lastLine() ? { line: range.end + 1, ch: 0 } : { line: range.end, ch: editor.getLine(range.end).length };
      const insertAt = { line: target, ch: editor.getLine(target).length };
      // Both edits in one transaction (one undo step); CodeMirror maps positions.
      editor.transaction({ changes: [{ from: removeFrom, to: removeTo, text: "" }, { from: insertAt, to: insertAt, text: `\n${text}` }] });
    }).open();
  }

  async slashCallout(editor, { from, to }) {
    const types = [["note", "Note"], ["info", "Info"], ["tip", "Tip"], ["important", "Important"], ["warning", "Warning"], ["question", "Question"]];
    new RikkaChoiceModal(this.app, "Callout type", types.map(([value, label]) => ({ value, label })), (type) => {
      this.insertBlock(editor, { from, to }, `> [!${type}]\n> `, "", "");
      editor.focus();
    }).open();
  }

  async slashEmoji(editor, { from, to }) {
    const list = "😀 smile|😂 laugh|🙂 slight smile|😉 wink|😍 love|🤔 think|😅 sweat|😎 cool|🙏 pray thanks|👍 thumbs up yes|👎 thumbs down no|👏 clap|🙌 celebrate|💪 strong|👀 eyes look|🎉 party tada|🔥 fire hot|✨ sparkles|⭐ star|💡 idea bulb|✅ done check|❌ cross no|⚠️ warning|❗ important|❓ question|📌 pin|📎 paperclip|📝 note memo|📚 books|📖 book read|🗂️ folders|📁 folder|📅 calendar date|⏰ alarm time|🚀 rocket launch|🎯 target goal|💬 comment|📣 announce|🔗 link|🔒 lock|🔑 key|💰 money|📈 chart up growth|📉 chart down|🧠 brain|❤️ heart|💜 purple heart|🌱 seedling grow|☕ coffee|🏁 finish flag|🛠️ tools build|🐛 bug|🎨 art design|🧪 test experiment|🗓️ schedule"
      .split("|").map((entry) => { const [emoji, ...words] = entry.split(" "); return { value: emoji, label: `${emoji}  ${words.join(" ")}` }; });
    new RikkaChoiceModal(this.app, "Search emoji", list, (emoji) => {
      this.replaceAndPlace(editor, from, to, emoji);
      editor.focus();
    }).open();
  }

  async slashBookmark(editor, { from, to }, embed) {
    new RikkaNameModal(this.app, embed ? "Embed a URL" : "Bookmark a web page", "https://…", (url) => {
      const clean = url.trim();
      if (!/^(https?:\/\/)[^\s]+$/i.test(clean)) { new Notice("Enter a full URL starting with https://"); return false; }
      let label = clean;
      try { label = new URL(clean).hostname.replace(/^www\./, ""); } catch (error) { /* keep raw */ }
      const text = embed ? `![](${clean})` : `[${label}](${clean})`;
      this.replaceAndPlace(editor, from, to, text);
      window.setTimeout(() => editor.focus(), 0);
    }, { buttonText: embed ? "Embed" : "Add", inputType: "url" }).open();
  }

  slashBreadcrumb(editor, { from, to }, file) {
    this.removeRange(editor, from, to);
    if (!(file instanceof TFile)) return;
    const parts = file.path.replace(/\.md$/i, "").split("/");
    new Notice(parts.join(" / "), 4000);
    // Show it in the Binder too (dynamic, nothing stale written into the note).
    const view = this.getView();
    if (view) { view.setSelected(file.path); this.setContextFromItem(file, "draft"); }
  }

  async slashNewPage(editor, { from, to }, file) {
    // New page goes next to the page being edited.
    const parent = file?.parent?.path && file.parent.path !== "/" ? file.parent.path : "";
    const where = parent ? parent.split("/").pop() : "vault root";
    new RikkaNameModal(this.app, `New page in ${where}`, "Page title", async (name) => {
      const safe = this.safeName(name);
      if (!safe) return false;
      const path = this.availablePath(parent, safe, "md");
      if (path !== `${parent ? `${parent}/` : ""}${safe}.md`) return path.split("/").pop().replace(/\.md$/, "");
      const created = await this.app.vault.create(path, "");
      const link = this.app.fileManager.generateMarkdownLink(created, file?.path || "");
      this.replaceAndPlace(editor, from, to, link);
      new Notice(`Created “${created.basename}”. Tap the link to open it.`);
      window.setTimeout(() => editor.focus(), 0);
    }, { subtitle: parent || "/", draftKey: `page:${parent}` }).open();
  }

  slashKanban(editor, { from, to }) {
    this.removeRange(editor, from, to);
    const id = Object.keys(this.app.commands?.commands || {}).find((key) => key.endsWith(":create-board") && key.includes("board"));
    if (id) this.app.commands.executeCommandById(id);
    else new Notice("Install or enable the Base Board plugin to create boards.");
  }

  // Attachments go through Obsidian's own attachment settings and never
  // overwrite an existing file (getAvailablePathForAttachment adds " 1", " 2"…).
  pickAttachment(editor, { from, to }, file, accept, embed) {
    this.removeRange(editor, from, to);
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.style.display = "none";
    document.body.appendChild(input);
    const cleanup = () => input.remove();
    input.addEventListener("change", async () => {
      const chosen = input.files?.[0];
      cleanup();
      if (!chosen) return;
      try {
        const sourcePath = file?.path || "";
        const target = await this.app.fileManager.getAvailablePathForAttachment(chosen.name, sourcePath);
        const created = await this.app.vault.createBinary(target, await chosen.arrayBuffer());
        const link = this.app.fileManager.generateMarkdownLink(created, sourcePath);
        const text = embed && !link.startsWith("!") ? `!${link}` : link;
        const at = editor.getCursor();
        editor.transaction({ changes: [{ from: at, to: at, text }], selection: { from: { line: at.line, ch: at.ch + text.length } } });
        editor.focus();
      } catch (error) {
        console.error("Rikka attachment failed", error);
        new Notice(`Couldn't add that file: ${error?.message || error}`);
      }
    }, { once: true });
    input.click();
  }

  availablePath(folder, base, extension) {
    const prefix = folder ? `${folder}/` : "";
    let path = `${prefix}${base}.${extension}`;
    for (let n = 2; this.app.vault.getAbstractFileByPath(path); n++) path = `${prefix}${base} ${n}.${extension}`;
    return path;
  }

  // ---- Current location ("context") -------------------------------------
  // The Binder always has one current location: a section (Draft, Research or
  // a collection) and optionally a folder inside it. Every "new" action uses
  // it, so things are created where the user is looking.

  sectionLabel(section) {
    if (section === "research") return "Research";
    if (section?.startsWith("collection:")) return section.slice("collection:".length);
    return "Draft";
  }

  validateContext() {
    const ctx = this.asRecord(this.data.context);
    let section = typeof ctx.section === "string" ? ctx.section : "draft";
    if (section.startsWith("collection:") && !this.data.collections?.[section.slice(11)]) section = "draft";
    if (!["draft", "research"].includes(section) && !section.startsWith("collection:")) section = "draft";
    let folder = typeof ctx.folder === "string" ? ctx.folder : "";
    // A folder that was deleted, renamed or synced away falls back to its
    // nearest surviving parent inside the project (never a stale path).
    while (folder && !(this.app.vault.getAbstractFileByPath(folder) instanceof TFolder)) {
      folder = folder.includes("/") ? folder.slice(0, folder.lastIndexOf("/")) : "";
    }
    if (folder && (!this.isInActiveProject(folder) || folder === this.activeProject.path)) folder = "";
    this.data.context = { section, folder };
    return this.data.context;
  }

  contextInfo(ctx = this.data.context) {
    const section = ctx?.section || "draft";
    const folder = ctx?.folder || "";
    const root = this.activeProject.path;
    const crumbs = [this.sectionLabel(section)];
    if (folder) {
      const relative = this.pathIsWithin(folder, root) ? folder.slice(root.length + 1) : folder;
      crumbs.push(...relative.split("/").filter(Boolean));
    }
    return {
      section,
      folder,
      name: crumbs[crumbs.length - 1],
      path: crumbs.join(" / "),
      // Where new files physically go: the folder, else the project root.
      targetPath: folder || root,
    };
  }

  setContext(section, folder = "", options = {}) {
    this.data.context = { section, folder };
    this.validateContext();
    if (options.expandFolder && folder) {
      const key = `folder:${section}:${folder}`;
      // Reveal the folder and its parents; never collapse anything here.
      for (let path = folder; path && this.pathIsWithin(path, this.activeProject.path) && path !== this.activeProject.path; path = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "") {
        this.data.collapsed[`folder:${section}:${path}`] = false;
      }
      this.data.collapsed[key] = false;
    }
    if (options.expandSection) {
      if (section.startsWith("collection:")) this.data.collapsed[section] = false;
      else this.data.collapsed[`section:${section}`] = false;
    }
    this.getView()?.updateContextHighlight(); // instant feedback, before the re-render
    void this.saveState();
  }

  setContextFromItem(item, section) {
    if (section === "trash") return;
    const parent = item.parent?.path;
    const roots = section === "research" ? this.data.research
      : section.startsWith("collection:") ? (this.data.collections[section.slice(11)] || [])
      : [this.activeProject.path];
    const usable = parent && parent !== "/" && parent !== this.activeProject.path
      && this.isInActiveProject(parent) && roots.some((root) => this.pathIsWithin(parent, root));
    const folder = usable ? parent : "";
    const ctx = this.data.context;
    if (ctx.section === section && ctx.folder === folder) return;
    this.data.context = { section, folder };
    this.validateContext();
    // Update highlights quietly; opening a document shouldn't rebuild the Binder.
    this.saveData(this.captureAndReturnData()).catch((error) => console.error("Rikka state save failed", error));
    this.getView()?.updateContextHighlight();
  }

  captureAndReturnData() {
    this.captureActiveProjectState();
    return this.data;
  }

  // Normalise the target for a create action: explicit {section, folder},
  // a folder path string (Draft), or nothing (= the current location).
  resolveCreateTarget(target) {
    if (typeof target === "string") return this.contextInfo({ section: "draft", folder: target === this.activeProject.path ? "" : target });
    if (target && typeof target === "object") return this.contextInfo(target);
    return this.contextInfo(this.validateContext());
  }

  // After creating something at the top level of Research or a collection,
  // register it there so it shows up where the user created it.
  async registerInSection(info, path) {
    if (info.folder) return;
    if (info.section === "research") {
      if (!this.data.research.includes(path)) this.data.research.push(path);
    } else if (info.section.startsWith("collection:")) {
      const name = info.section.slice(11);
      const paths = this.data.collections[name] || [];
      if (!paths.includes(path)) this.data.collections[name] = [...paths, path];
    }
  }

  async promptNewNote(target) {
    const info = this.resolveCreateTarget(target);
    if (!(this.app.vault.getAbstractFileByPath(info.targetPath) instanceof TFolder)) {
      new Notice(`The folder “${info.path}” no longer exists.`);
      return;
    }
    new RikkaNameModal(this.app, `New document in ${info.name}`, "Document title", async (name) => {
      const safe = this.safeName(name);
      if (!safe) return;
      const path = `${info.targetPath}/${safe}.md`;
      if (this.app.vault.getAbstractFileByPath(path)) {
        return this.availablePath(info.targetPath, safe, "md").split("/").pop().replace(/\.md$/, "");
      }
      const file = await this.app.vault.create(path, "");
      await this.registerInSection(info, file.path);
      // Keep working in the same place, with the new document visible and selected.
      this.data.context = { section: info.section, folder: info.folder };
      if (info.folder) this.data.collapsed[`folder:${info.section}:${info.folder}`] = false;
      await this.saveState();
      this.getView() && (this.getView().selectedPath = file.path);
      // Creating a document is a writing workflow: open it.
      await this.openFile(file);
    }, { buttonText: "Create", subtitle: info.path, draftKey: `note:${info.section}:${info.targetPath}` }).open();
  }

  async promptNewFolder(target) {
    const info = this.resolveCreateTarget(target);
    if (!(this.app.vault.getAbstractFileByPath(info.targetPath) instanceof TFolder)) {
      new Notice(`The folder “${info.path}” no longer exists.`);
      return;
    }
    new RikkaNameModal(this.app, `New folder in ${info.name}`, "Folder name", async (name) => {
      const safe = this.safeName(name);
      if (!safe) return;
      const path = `${info.targetPath}/${safe}`;
      if (this.app.vault.getAbstractFileByPath(path)) {
        let n = 2;
        while (this.app.vault.getAbstractFileByPath(`${info.targetPath}/${safe} ${n}`)) n++;
        return `${safe} ${n}`;
      }
      await this.app.vault.createFolder(path);
      await this.registerInSection(info, path);
      // Stay in the current location; show the new folder inside it.
      if (info.folder) this.data.collapsed[`folder:${info.section}:${info.folder}`] = false;
      await this.saveState();
    }, { buttonText: "Create", subtitle: info.path, draftKey: `folder:${info.section}:${info.targetPath}` }).open();
  }

  showToolbarMore(event) {
    const menu = new Menu();
    const info = this.contextInfo();
    menu.addItem((entry) => entry.setTitle(`New from template in ${info.name}…`).setIcon("files").onClick(() => this.promptNewFromTemplate()));
    menu.addItem((entry) => entry.setTitle("New collection…").setIcon("library").onClick(() => this.promptNewCollection()));
    menu.addSeparator();
    // Phone has no room for the grid button in the toolbar, so it lives here.
    if (Platform.isMobile) {
      menu.addItem((entry) => entry.setTitle("All projects…").setIcon("layout-grid").onClick(() => new RikkaProjectsModal(this).open()));
      menu.addSeparator();
    }
    menu.addItem((entry) => entry.setTitle("Compile Draft to Markdown").setIcon("scroll-text").onClick(() => this.runSafely(() => this.compileDraft(), "Compile Draft")));
    if (event instanceof MouseEvent) menu.showAtMouseEvent(event);
    else menu.showAtPosition({ x: 0, y: 0 });
  }

  async moveIntoFolder(path, folder) {
    const item = this.app.vault.getAbstractFileByPath(path);
    if (!item || !(folder instanceof TFolder)) return;
    if (item === folder || item.parent === folder) return;
    if (item instanceof TFolder && (folder.path === item.path || folder.path.startsWith(`${item.path}/`))) {
      new Notice("Can't move a folder inside itself.");
      return;
    }
    const target = `${folder.path}/${item.name}`;
    if (this.app.vault.getAbstractFileByPath(target)) {
      new Notice(`"${item.name}" already exists in ${folder.name}.`);
      return;
    }
    await this.app.fileManager.renameFile(item, target);
    this.refreshViews();
  }

  // Mobile-friendly move: one flat list of destinations ("Draft / A / B"),
  // current location marked, tap to move. No tree, no typing paths.
  promptMoveToFolder(item, section = "draft") {
    const root = this.app.vault.getAbstractFileByPath(this.activeProject.path);
    if (!(root instanceof TFolder)) return;
    const inResearch = this.data.research.includes(item.path);
    const currentParent = item.parent?.path === root.path ? "" : item.parent?.path;
    const choices = [];
    // Label each folder by where it lives in the Binder (Draft or Research).
    const label = (path) => {
      const inRes = this.data.research.some((root) => this.pathIsWithin(path, root));
      return this.contextInfo({ section: inRes ? "research" : "draft", folder: path }).path;
    };
    const mark = (text, isCurrent) => isCurrent ? `${text}  · current` : text;
    choices.push({ value: { kind: "folder", path: root.path }, label: mark("Draft (top level)", !inResearch && !currentParent) });
    const walk = (folder) => {
      for (const child of [...folder.children].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))) {
        if (!(child instanceof TFolder) || child.name === "_Rikka") continue;
        if (item instanceof TFolder && this.pathIsWithin(child.path, item.path)) continue;
        choices.push({ value: { kind: "folder", path: child.path }, label: mark(label(child.path), !inResearch && child.path === currentParent) });
        walk(child);
      }
    };
    walk(root);
    choices.push({ value: { kind: "research" }, label: mark("Research", inResearch) });
    new RikkaChoiceModal(this.app, `Move “${item.name}” to…`, choices, (dest) => this.runSafely(async () => {
      if (dest.kind === "research") {
        await this.moveToCollection(item.path, "research");
      } else {
        const folder = this.app.vault.getAbstractFileByPath(dest.path);
        if (inResearch || this.data.trash.includes(item.path)) await this.moveToCollection(item.path, "draft");
        await this.moveIntoFolder(item.path, folder);
      }
      new Notice(`Moved “${item.name}” to ${dest.kind === "research" ? "Research" : label(dest.path === root.path ? "" : dest.path)}.`);
    }, "Move")).open();
  }

  // Natural titles in, filesystem-safe names out: reserved characters become
  // "—", whitespace is collapsed, leading dots (hidden files) and trailing
  // dots/spaces are dropped, and very long names are trimmed.
  safeName(value) {
    let name = String(value)
      .replace(/[\u0000-\u001f]/g, "")
      .replace(/\s*[\\/]\s*/g, " - ")      // a/b   -> a - b
      .replace(/\s*:\s*/g, " - ")            // Q: x  -> Q - x
      .replace(/"/g, "'")
      .replace(/[*?<>|#^\[\]]/g, "")
      .replace(/(\s-)+\s*$/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^\.+/, "")
      .replace(/[. ]+$/g, "")
      .replace(/^-\s+|\s+-$/g, "")
      .trim();
    if (name.length > 180) name = name.slice(0, 180).trim();
    return name === "." || name === ".." ? "" : name;
  }

  async moveToCollection(path, collection) {
    if (!["draft", "research", "trash"].includes(collection)) return;
    this.data.research = this.data.research.filter((item) => item !== path);
    this.data.trash = this.data.trash.filter((item) => item !== path);
    if (collection !== "draft" && !this.data[collection].includes(path)) this.data[collection].push(path);
    await this.saveState();
  }

  // Short, contextual menus. Folder: create inside / rename / move / trash.
  // Document: open / rename / move / duplicate / details… / trash.
  showItemMenu(item, section, event) {
    const menu = new Menu();
    const safe = (action, label) => () => this.runSafely(action, label);
    const isFile = item instanceof TFile;
    const point = { x: event.clientX, y: event.clientY };

    if (section === "trash") {
      menu.addItem((entry) => entry.setTitle("Restore").setIcon("rotate-ccw").onClick(safe(() => this.moveToCollection(item.path, "draft"), "Restore")));
      menu.showAtMouseEvent(event);
      return;
    }

    if (isFile) {
      menu.addItem((entry) => entry.setTitle("Open").setIcon("file").onClick(safe(() => { this.getView()?.setSelected(item.path); this.setContextFromItem(item, section); return this.openFile(item); }, "Open")));
      if (!Platform.isMobile) menu.addItem((entry) => entry.setTitle("Open in new tab").setIcon("file-plus-2").onClick(safe(() => this.openFile(item, true), "Open in new tab")));
    } else {
      const here = { section, folder: item.path };
      menu.addItem((entry) => entry.setTitle("New document").setIcon("file-plus-2").onClick(() => this.promptNewNote(here)));
      menu.addItem((entry) => entry.setTitle("New folder").setIcon("folder-plus").onClick(() => this.promptNewFolder(here)));
    }
    menu.addSeparator();
    menu.addItem((entry) => entry.setTitle("Rename…").setIcon("pencil").onClick(() => this.promptRename(item)));
    menu.addItem((entry) => entry.setTitle("Move…").setIcon("folder-input").onClick(() => this.promptMoveToFolder(item, section)));
    if (isFile) {
      menu.addItem((entry) => entry.setTitle("Duplicate").setIcon("copy").onClick(safe(() => this.duplicateFile(item), "Duplicate")));
      menu.addItem((entry) => entry.setTitle("Details…").setIcon("sliders-horizontal").onClick(() => {
        // Opened after this menu closes, at the same spot.
        window.setTimeout(() => this.showDetailsMenu(item, section, point), 50);
      }));
    }
    menu.addSeparator();
    if (section.startsWith("collection:")) {
      const name = section.slice("collection:".length);
      menu.addItem((entry) => entry.setTitle("Remove from collection").setIcon("list-minus").onClick(safe(() => this.removeFromCollection(name, item.path), "Remove from collection")));
    }
    menu.addItem((entry) => entry.setTitle("Move to Trash").setIcon("trash-2").setWarning(true).onClick(safe(async () => {
      await this.moveToCollection(item.path, "trash");
      new Notice(`Moved “${item.name}” to Trash. Restore it from Trash in the Binder.`);
    }, "Move to Trash")));
    menu.showAtMouseEvent(event);
  }

  // Less frequent document actions, kept out of the main long-press menu.
  showDetailsMenu(item, section, point) {
    const menu = new Menu();
    const safe = (action, label) => () => this.runSafely(action, label);
    if (item.extension === "md") {
      menu.addItem((entry) => entry.setTitle("Status…").setIcon("badge-check").onClick(() => {
        const choices = ["Draft", "Revised", "Final", "Needs work", "Research"].map((value) => ({ value, label: value }));
        new RikkaChoiceModal(this.app, `Status for ${item.basename}`, choices, (value) => this.setFileProperty(item, "rikka_status", value)).open();
      }));
      menu.addItem((entry) => entry.setTitle("Color label…").setIcon("paintbrush").onClick(() => {
        const choices = Object.keys(RIKKA_LABELS).map((value) => ({ value, label: value }));
        new RikkaChoiceModal(this.app, `Color label for ${item.basename}`, choices, (value) => this.setFileProperty(item, "rikka_label", value)).open();
      }));
      menu.addItem((entry) => entry.setTitle("Icon…").setIcon("star").onClick(() => {
        const choices = [{ value: "", label: "Default" }, ...RIKKA_ICONS.map((value) => ({ value, label: value }))];
        new RikkaChoiceModal(this.app, `Icon for ${item.basename}`, choices, (value) => this.setFileProperty(item, "rikka_icon", value)).open();
      }));
      menu.addItem((entry) => entry.setTitle("Synopsis…").setIcon("align-left").onClick(() => {
        const synopsis = this.app.metadataCache.getFileCache(item)?.frontmatter?.rikka_synopsis || "";
        new RikkaTextModal(this.app, `Synopsis · ${item.basename}`, synopsis, (value) => this.setFileProperty(item, "rikka_synopsis", value)).open();
      }));
      menu.addItem((entry) => entry.setTitle("Clear status & label").setIcon("eraser").onClick(safe(() => this.clearRikkaLabels(item), "Clear status & label")));
      menu.addSeparator();
      const included = this.app.metadataCache.getFileCache(item)?.frontmatter?.rikka_include !== false;
      menu.addItem((entry) => entry.setTitle(included ? "Exclude from compile" : "Include in compile").setIcon(included ? "circle-minus" : "circle-check").onClick(safe(() => this.setFileProperty(item, "rikka_include", included ? false : true), "Update compile setting")));
      const isTemplate = (this.data.templates || []).includes(item.path);
      menu.addItem((entry) => entry.setTitle(isTemplate ? "Remove from templates" : "Save as template").setIcon("files").onClick(safe(async () => {
        this.data.templates ||= [];
        this.data.templates = isTemplate ? this.data.templates.filter((path) => path !== item.path) : [...this.data.templates, item.path];
        await this.saveState();
        new Notice(isTemplate ? "Removed from templates." : "Saved as a template.");
      }, isTemplate ? "Remove template" : "Save template")));
      menu.addItem((entry) => entry.setTitle("Take snapshot").setIcon("history").onClick(safe(() => this.takeSnapshot(item), "Take snapshot")));
      menu.addItem((entry) => entry.setTitle("Compare with latest snapshot").setIcon("git-compare").onClick(safe(() => this.openLatestSnapshotBeside(item), "Compare with snapshot")));
      menu.addSeparator();
    }
    menu.addItem((entry) => entry.setTitle("Add to collection…").setIcon("library").onClick(() => this.addToCollection(item)));
    if (!Platform.isPhone) menu.addItem((entry) => entry.setTitle("Open to the right").setIcon("columns-2").onClick(safe(() => this.openFile(item, false, true), "Open to the right")));
    menu.showAtPosition(point);
  }

  async duplicateFile(file) {
    const parent = file.parent?.path && file.parent.path !== "/" ? `${file.parent.path}/` : "";
    let path = `${parent}${file.basename} copy.${file.extension}`;
    for (let n = 2; this.app.vault.getAbstractFileByPath(path); n++) path = `${parent}${file.basename} copy ${n}.${file.extension}`;
    const created = await this.app.vault.copy(file, path);
    for (const name of Object.keys(this.data.collections)) {
      if (this.data.collections[name].includes(file.path)) this.data.collections[name].push(created.path);
    }
    if (this.data.research.includes(file.path)) this.data.research.push(created.path);
    await this.saveState();
    this.getView() && (this.getView().selectedPath = created.path);
    new Notice(`Duplicated as “${created.basename}”.`);
  }

  promptRename(item) {
    const native = this.app.fileManager?.promptForFileRename;
    if (typeof native === "function" && item instanceof TFile) {
      native.call(this.app.fileManager, item);
      return;
    }
    const current = item instanceof TFile ? item.basename : item.name;
    new RikkaNameModal(this.app, `Rename ${current}`, current, async (name) => {
      const safe = this.safeName(name);
      if (!safe || safe === current) return;
      const parent = item.parent?.path && item.parent.path !== "/" ? `${item.parent.path}/` : "";
      const target = `${parent}${safe}${item instanceof TFile ? `.${item.extension}` : ""}`;
      if (this.app.vault.getAbstractFileByPath(target)) {
        new Notice(`"${safe}" already exists here.`);
        return;
      }
      await this.app.fileManager.renameFile(item, target);
    }, { buttonText: "Rename", initialValue: current }).open();
  }
};
