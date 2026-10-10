const { ItemView, Menu, Modal, Notice, Platform, Plugin, Setting, TFile, TFolder, setIcon, parseYaml, stringifyYaml } = require("obsidian");

const VIEW_TYPE = "rikka-binder";
const DEFAULT_DATA = { collapsed: {}, research: [], trash: [], collections: {}, templates: [], wordTarget: 0 };
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
  "BinderText@2x@2x.png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAANBGlDQ1BrQ0dDb2xvclNwYWNlR2VuZXJpY0dyYXlHYW1tYTJfMgAAWIWlVwdck9cWv9/IAJKwp4ywkWVAgQAyIjOA7CG4iEkggRBiBgLiQooVrFscOCoqilpcFYE6UYtW6satD2qpoNRiLS6svpsEEKvte+/3vvzud//fPefcc8495557A4DuRo5EIkIBAHliuTQikZU+KT2DTroHyMAYaAN3oM3hyiSs+PgYyALE+WI++OR5cQMgyv6am3KuT+n/+BB4fBkX9idhK+LJuHkAIOMBIJtxJVI5ABqT4LjtLLlEiUsgNshNTgyBeDnkoQzKKh+rCL6YLxVy6RFSThE9gpOXx6F7unvS46X5WULRZ6z+f588kWJYN2wUWW5SNOzdof1lPE6oEvtBfJDLCUuCmAlxb4EwNRbiYABQO4l8QiLEURDzFLkpLIhdIa7PkoanQBwI8R2BIlKJxwGAmRQLktMgNoM4Jjc/WilrA3GWeEZsnFoX9iVXFpIBsRPELQI+WxkzO4gfS/MTlTzOAOA0Hj80DGJoB84UytnJg7hcVpAUprYTv14sCIlV6yJQcjhR8RA7QOzAF0UkquchxEjk8co54TehQCyKjVH7RTjHl6n8hd9EslyQHAmxJ8TJcmlyotoeYnmWMJwNcTjEuwXSyES1v8Q+iUiVZ3BNSO4caViEek1IhVJFYoraR9J2vjhFOT/MEdIDkIpwAB/kgxnwzQVi0AnoQAaEoECFsgEH5MFGhxa4whYBucSwSSGHDOSqOKSga5g+JKGUcQMSSMsHWZBXBCWHxumAB2dQSypnyYdN+aWcuVs1xh3U6A5biOUOoIBfAtAL6QKIJoIO1UghtDAP9iFwVAFp2RCP1KKWj1dZq7aBPmh/z6CWfJUtnGG5D7aFQLoYFMMR2ZBvuDHOwMfC5o/H4AE4QyUlhRxFwE01Pl41NqT1g+dK33qGtc6Eto70fuSKDa3iKSglh98i6KF4cH1k0Jq3UCZ3UPovfi43UzhJJFVLE9jTatUjpdLpQu6lZX2tJUdNAP3GkpPnAX2vTtO5YRvp7XjjlGuU1pJ/iOqntn0c1biReaPKJN4neQN1Ea4SLhMeEK4DOux/JrQTuiG6S7gHf7eH7fkQA/XaDOWE2i4ugg3bwIKaRSpqHmxCFY9sOB4KiOXwnaWSdvtLLCI+8WgkPX9YezZs+X+1YTBj+Cr9nM+uz/+yQ0asZJZ4uZlEMq22ZIAvUa+HMnb8RbEvYkGpK2M/o5exnbGX8Zzx4EP8GDcZvzLaGVsh5Qm2CjuMHcOasGasDdDhVzN2CmtSob3YUfg78Dc7IvszO0KZYdzBHaCkygdzcOReGekza0Q0lPxDa5jzN/k9MoeUa/nfWTRyno8rCP/DLqXZ0jxoJJozzYvGoiE0a/jzpAVDZEuzocXQjCE1kuZIC6WNGpF36oiJBjNI+FE9UFucDqlDmSZWVSMO5FRycAb9/auP9I+8VHomHJkbCBXmhnBEDflc7aJ/tNdSoKwQzFLJy1TVQaySk3yU3zJV1YIjyGRVDD9jG9GP6EgMIzp+0EMMJUYSw2HvoRwnjiFGQeyr5MItcQ+cDatbHKDjLNwLDx7E6oo3VPNUUcWDIDUQD8WZyhr50U7g/kdPR+5CeNeQ8wvlyotBSL6kSCrMFsjpLHgz4tPZYq67K92T4QFPROU9S319eJ6guj8hRm1chbRAPYYrXwSgCe9gBsAUWAJbeKq7QV0+wB+es2HwjIwDyTCy06B1AmiNFK5tCVgAykElWA7WgA1gC9gO6kA9OAiOgKOwKn8PLoDLoB3chSdQF3gC+sALMIAgCAmhIvqIKWKF2CMuiCfCRAKRMCQGSUTSkUwkGxEjCqQEWYhUIiuRDchWpA45gDQhp5DzyBXkNtKJ9CC/I29QDKWgBqgF6oCOQZkoC41Gk9GpaDY6Ey1Gy9Cl6Dq0Bt2LNqCn0AtoO9qBPkH7MYBpYUaYNeaGMbEQLA7LwLIwKTYXq8CqsBqsHlaBVuwa1oH1Yq9xIq6P03E3GJtIPAXn4jPxufgSfAO+C2/Az+DX8E68D39HoBLMCS4EPwKbMImQTZhFKCdUEWoJhwlnYdXuIrwgEolGMC98YL6kE3OIs4lLiJuI+4gniVeID4n9JBLJlORCCiDFkTgkOamctJ60l3SCdJXURXpF1iJbkT3J4eQMsphcSq4i7yYfJ18lPyIPaOho2Gv4acRp8DSKNJZpbNdo1rik0aUxoKmr6agZoJmsmaO5QHOdZr3mWc17ms+1tLRstHy1ErSEWvO11mnt1zqn1an1mqJHcaaEUKZQFJSllJ2Uk5TblOdUKtWBGkzNoMqpS6l11NPUB9RXNH2aO41N49Hm0appDbSrtKfaGtr22iztadrF2lXah7QvaffqaOg46ITocHTm6lTrNOnc1OnX1df10I3TzdNdortb97xutx5Jz0EvTI+nV6a3Te+03kN9TN9WP0Sfq79Qf7v+Wf0uA6KBowHbIMeg0uAbg4sGfYZ6huMMUw0LDasNjxl2GGFGDkZsI5HRMqODRjeM3hhbGLOM+caLjeuNrxq/NBllEmzCN6kw2WfSbvLGlG4aZpprusL0iOl9M9zM2SzBbJbZZrOzZr2jDEb5j+KOqhh1cNQdc9Tc2TzRfLb5NvM2834LS4sIC4nFeovTFr2WRpbBljmWqy2PW/ZY6VsFWgmtVludsHpMN6Sz6CL6OvoZep+1uXWktcJ6q/VF6wEbR5sUm1KbfTb3bTVtmbZZtqttW2z77KzsJtqV2O2xu2OvYc+0F9ivtW+1f+ng6JDmsMjhiEO3o4kj27HYcY/jPSeqU5DTTKcap+ujiaOZo3NHbxp92Rl19nIWOFc7X3JBXbxdhC6bXK64Elx9XcWuNa433ShuLLcCtz1une5G7jHupe5H3J+OsRuTMWbFmNYx7xheDBE83+566HlEeZR6NHv87unsyfWs9rw+ljo2fOy8sY1jn41zGccft3ncLS99r4lei7xavP709vGWetd79/jY+WT6bPS5yTRgxjOXMM/5Enwn+M7zPer72s/bT+530O83fzf/XP/d/t3jHcfzx28f/zDAJoATsDWgI5AemBn4dWBHkHUQJ6gm6Kdg22BecG3wI9ZoVg5rL+vpBMYE6YTDE16G+IXMCTkZioVGhFaEXgzTC0sJ2xD2INwmPDt8T3hfhFfE7IiTkYTI6MgVkTfZFmwuu47dF+UTNSfqTDQlOil6Q/RPMc4x0pjmiejEqImrJt6LtY8Vxx6JA3HsuFVx9+Md42fGf5dATIhPqE74JdEjsSSxNUk/aXrS7qQXyROSlyXfTXFKUaS0pGqnTkmtS32ZFpq2Mq1j0phJcyZdSDdLF6Y3ZpAyUjNqM/onh01eM7lriteU8ik3pjpOLZx6fprZNNG0Y9O1p3OmH8okZKZl7s58y4nj1HD6Z7BnbJzRxw3hruU+4QXzVvN6+AH8lfxHWQFZK7O6swOyV2X3CIIEVYJeYYhwg/BZTmTOlpyXuXG5O3Pfi9JE+/LIeZl5TWI9ca74TL5lfmH+FYmLpFzSMdNv5pqZfdJoaa0MkU2VNcoN4J/SNoWT4gtFZ0FgQXXBq1mpsw4V6haKC9uKnIsWFz0qDi/eMRufzZ3dUmJdsqCkcw5rzta5yNwZc1vm2c4rm9c1P2L+rgWaC3IX/FjKKF1Z+sfCtIXNZRZl88sefhHxxZ5yWrm0/OYi/0VbvsS/FH55cfHYxesXv6vgVfxQyaisqny7hLvkh688vlr31fulWUsvLvNetnk5cbl4+Y0VQSt2rdRdWbzy4aqJqxpW01dXrP5jzfQ156vGVW1Zq7lWsbZjXcy6xvV265evf7tBsKG9ekL1vo3mGxdvfLmJt+nq5uDN9VsstlRuefO18OtbWyO2NtQ41FRtI24r2PbL9tTtrTuYO+pqzWora//cKd7ZsStx15k6n7q63ea7l+1B9yj29OydsvfyN6HfNNa71W/dZ7Svcj/Yr9j/+EDmgRsHow+2HGIeqv/W/tuNh/UPVzQgDUUNfUcERzoa0xuvNEU1tTT7Nx/+zv27nUetj1YfMzy27Ljm8bLj708Un+g/KTnZeyr71MOW6S13T086ff1MwpmLZ6PPnvs+/PvTrazWE+cCzh0973e+6QfmD0cueF9oaPNqO/yj14+HL3pfbLjkc6nxsu/l5ivjrxy/GnT11LXQa99fZ1+/0B7bfuVGyo1bN6fc7LjFu9V9W3T72Z2COwN358OLfcV9nftVD8wf1Pxr9L/2dXh3HOsM7Wz7Kemnuw+5D5/8LPv5bVfZL9Rfqh5ZParr9uw+2hPec/nx5MddTyRPBnrLf9X9deNTp6ff/hb8W1vfpL6uZ9Jn739f8tz0+c4/xv3R0h/f/+BF3ouBlxWvTF/tes183fom7c2jgVlvSW/X/Tn6z+Z30e/uvc97//7fCQ/4Yk7kYoUAAAA4ZVhJZk1NACoAAAAIAAGHaQAEAAAAAQAAABoAAAAAAAKgAgAEAAAAAQAAACCgAwAEAAAAAQAAACAAAAAAj05AyQAAAG1JREFUSA1jYBhowAh3gC+cRRxjM0QZE3GqcatiQZb6vwmZh5vN6IeQo9gFw8AAlECEBc1ZGAONNkbjg7gUhwFWF2CzCYvlYCHauGA0DBgYRsNgxIUBxZlp4A1AKVCQy3tcBQi6OMVeQDeQ/nwA4u8IZ8FohyIAAAAASUVORK5CYII=",
  "BinderTrashEmpty@2x@2x.png": "data:image/png;base64,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",
  "BinderTrashFull@2x@2x.png": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAIKADAAQAAAABAAAAIAAAAACshmLzAAABz0lEQVRYCWNkIB2wArWIAjE/EHMA8UcgvgfEZAEWInXBLBUGqgdhZAByCAiQ5QhCDmACGqwGxBIgG0BAVlaKrb0139TGysiBl4dbXFjCqgsoLAPEnEAMCo33QPwViIkChBwAthxkaUdrgZm1laGDtJS4JQsLMxfMdH9fJ52Nm/e9APKVgPgzVPwHkAY55i0Qv4KKYaUYsYoiBM2BTM6vH84s5uLiBPkSA2zZemDXX0ZpfQ4OjgdMTExHVq5ceW7u3LnPkBReA7JxOoKQAzSAmiWuX96Sq6GuGIRkKJz54f3ndxeufRfi5ORkMDcHuZeB4fv3788fPnx4QlNTcxKQ+xSIb4PEsQFcDgAlLFMgBqV2aoDXQENOAzEoWlAAMwoPwbEFMqllOchUbiAWAGKMnIIrEYItf/To0TKQbkqBnJxcFNAMrB4CZbMBBaMOICkE7t69ywDCMECID1OHj8aVCLHq+fbtG4o4IT6KYhwckkIAhxkUCY86YDQERkNgNARGQ4CkuoCLC94YBhe/hPjElNEkOUBZWRnFTEJ8FMU4OKNpYMBDAFe/wAUYZVhbsTiikhhhUN9gD7pCXP0CUJ8O1I4HteepAUCWnwbin+iGAQAAxGV0kXqebgAAAABJRU5ErkJggg=="
};

class RikkaChoiceModal extends Modal {
  constructor(app, title, choices, onSubmit) {
    super(app);
    this.title = title;
    this.choices = choices;
    this.onSubmit = onSubmit;
    this.value = choices[0]?.value || "";
  }

  onOpen() {
    this.setTitle(this.title);
    new Setting(this.contentEl).setName("Choose").addDropdown((dropdown) => {
      for (const choice of this.choices) dropdown.addOption(choice.value, choice.label);
      dropdown.setValue(this.value).onChange((value) => { this.value = value; });
    });
    new Setting(this.contentEl).addButton((button) => {
      button.setButtonText("Apply").setCta().onClick(async () => {
        try {
          await this.onSubmit(this.value);
          this.close();
        } catch (error) {
          console.error("Rikka action failed", error);
          new Notice(`Could not complete that action: ${error?.message || error}`);
        }
      });
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

class RikkaNameModal extends Modal {
  constructor(app, title, placeholder, onSubmit) {
    super(app);
    this.title = title;
    this.placeholder = placeholder;
    this.onSubmit = onSubmit;
  }

  onOpen() {
    this.setTitle(this.title);
    new Setting(this.contentEl)
      .setName("Name")
      .addText((text) => {
        text.setPlaceholder(this.placeholder).onChange((value) => { this.value = value; });
        text.inputEl.addEventListener("keydown", (event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void this.submit();
          }
        });
        window.setTimeout(() => text.inputEl.focus(), 0);
      });
    new Setting(this.contentEl).addButton((button) => {
      button.setButtonText("Create").setCta().onClick(() => void this.submit());
    });
  }

  async submit() {
    const name = (this.value || "").trim();
    if (!name) return;
    try {
      await this.onSubmit(name);
      this.close();
    } catch (error) {
      console.error("Rikka action failed", error);
      new Notice(`Could not complete that action: ${error?.message || error}`);
    }
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
    root.empty();
    root.addClass("rikka-binder");
    try {
      const toolbar = root.createDiv({ cls: "rikka-toolbar" });
    const projectPicker = toolbar.createEl("select", { cls: "rikka-project-picker", attr: { "aria-label": "Active project" } });
    for (const project of this.plugin.projects) projectPicker.createEl("option", { value: project.id, text: project.name });
    projectPicker.createEl("option", { value: "__new_project__", text: "＋ New project…" });
    projectPicker.value = this.plugin.data.activeProject;
    projectPicker.addEventListener("change", () => {
      if (projectPicker.value === "__new_project__") {
        projectPicker.value = this.plugin.data.activeProject;
        this.plugin.promptNewProject();
      } else {
        this.plugin.runSafely(() => this.plugin.selectProject(projectPicker.value), "Switch project");
      }
    });
    const actions = toolbar.createDiv({ cls: "rikka-toolbar-actions" });
    this.makeToolbarButton(actions, "file-plus-2", "New document", () => this.plugin.promptNewNote());
    this.makeToolbarButton(actions, "files", "New from template", () => this.plugin.promptNewFromTemplate());
    this.makeToolbarButton(actions, "scroll-text", "Compile Draft to Markdown", () => this.plugin.compileDraft());
    this.makeToolbarButton(actions, "folder-plus", "New folder", () => this.plugin.promptNewFolder());
    this.makeToolbarButton(actions, "library", "New collection", () => this.plugin.promptNewCollection());

    const target = root.createDiv({ cls: "rikka-target" });
    void this.plugin.renderWordTarget(target);

    const scroll = root.createDiv({ cls: "rikka-scroll" });
    const draftItems = this.plugin.getDraftItems();
    this.renderSection(scroll, "draft", "Draft", "folder", draftItems, "The project’s working documents appear here.");
    const researchItems = this.plugin.getCollectionItems("research");
    this.renderSection(scroll, "research", "Research", "library", researchItems, "Move a note here from its menu, or drag it into this section.");
    this.renderSavedCollections(scroll);
    const trashItems = this.plugin.getCollectionItems("trash");
    this.renderSection(scroll, "trash", "Trash", "trash-2", trashItems, "Items sent to Rikka Trash can be restored.");
    } catch (error) {
      console.error("Rikka Binder render failed", error);
      root.createDiv({ cls: "rikka-error", text: `Rikka could not render the Binder: ${error?.message || error}` });
    }
  }

  makeToolbarButton(parent, icon, label, callback) {
    const button = parent.createEl("button", { cls: "rikka-icon-button", attr: { "aria-label": label, title: label } });
    setIcon(button, icon);
    button.addEventListener("click", () => this.plugin.runSafely(callback, label));
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
    section.addEventListener("dragover", (event) => { event.preventDefault(); section.addClass("rikka-drop-target"); });
    section.addEventListener("dragleave", () => section.removeClass("rikka-drop-target"));
    section.addEventListener("drop", (event) => {
      event.preventDefault();
      section.removeClass("rikka-drop-target");
      const path = event.dataTransfer?.getData("text/plain");
      if (path) this.plugin.runSafely(() => this.plugin.moveToCollection(path, key === "research" ? "research" : key === "trash" ? "trash" : "draft"), "Move document");
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
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      this.plugin.toggleCollapsed(`section:${key}`);
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
      const groupHeading = group.createDiv({ cls: "rikka-collection-heading" });
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
    row.draggable = true;
    row.addEventListener("dragstart", (event) => {
      event.dataTransfer?.setData("text/plain", item.path);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
    });
    row.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      this.plugin.showItemMenu(item, sectionKey, event);
    });

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
      let clickTimer;
      row.addEventListener("click", (event) => {
        if (event.target.closest("button")) return;
        window.clearTimeout(clickTimer);
        clickTimer = window.setTimeout(() => {
          this.plugin.runSafely(() => this.plugin.toggleCollapsed(`folder:${sectionKey}:${item.path}`), "Toggle folder");
        }, 220);
      });
      row.addEventListener("dblclick", (event) => {
        event.preventDefault();
        window.clearTimeout(clickTimer);
        this.plugin.runSafely(() => this.plugin.toggleCollapsed(`folder:${sectionKey}:${item.path}`), "Toggle folder");
      });

      if (!collapsed) {
        const children = parent.createDiv({ cls: "rikka-children" });
        children.style.setProperty("--rikka-depth", String(depth + 1));
        const visibleChildren = this.plugin.getVisibleChildren(item, sectionKey);
        for (const child of visibleChildren) this.renderNode(children, child, depth + 1, sectionKey);
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
      this.selectedPath = item.path;
      const openInNewTab = !Platform.isMobile && (event.metaKey || event.ctrlKey);
      this.plugin.runSafely(async () => {
        await this.plugin.openFile(item, openInNewTab);
        this.render();
      }, "Open document");
    });
    row.addEventListener("dblclick", (event) => event.preventDefault());
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
    this.data.wordTarget = Number.isFinite(Number(this.data.wordTarget)) && Number(this.data.wordTarget) > 0 ? Number(this.data.wordTarget) : 0;
    this.wordCountCache = new Map();
    this.stateSaveQueue = Promise.resolve();

    this.registerView(VIEW_TYPE, (leaf) => new RikkaBinderView(leaf, this));
    this.addRibbonIcon("library", "Open Rikka Binder", () => this.runSafely(() => this.activateView(), "Open Rikka Binder"));
    this.addCommand({ id: "open-binder", name: "Open Rikka Binder", callback: () => this.runSafely(() => this.activateView(), "Open Rikka Binder") });
    this.addCommand({ id: "new-draft-note", name: "New document in Draft", callback: () => this.promptNewNote() });
    this.addCommand({ id: "new-draft-folder", name: "New folder in Draft", callback: () => this.promptNewFolder() });

    this.registerEvent(this.app.vault.on("create", () => this.refreshViews()));
    this.registerEvent(this.app.vault.on("delete", (file) => {
      void this.removeStoredPath(file.path).catch((error) => {
        console.error("Rikka cleanup after deletion failed", error);
        new Notice(`Could not update Rikka after deletion: ${error?.message || error}`);
      });
      this.refreshViews();
    }));
    this.registerEvent(this.app.vault.on("rename", (file, oldPath) => {
      void this.renameStoredPath(oldPath, file.path).catch((error) => {
        console.error("Rikka path update after rename failed", error);
        new Notice(`Could not update Rikka after rename: ${error?.message || error}`);
      });
      this.refreshViews();
    }));
    this.registerEvent(this.app.vault.on("modify", (file) => {
      this.wordCountCache.delete(file.path);
      window.clearTimeout(this.refreshTimer);
      this.refreshTimer = window.setTimeout(() => this.refreshViews(), 800);
    }));

    this.installBoardCreationSupport();
    this.installMobileBoardSupport();

    this.app.workspace.onLayoutReady(() => this.runSafely(() => this.activateView(), "Open Rikka Binder"));
  }

  onunload() {
    window.clearTimeout(this.refreshTimer);
    this.mobileBoardObserver?.disconnect();
    for (const cleanup of this.mobileBoardCleanups || []) cleanup();
    this.mobileBoardCleanups?.clear();
    this.app.workspace.detachLeavesOfType(VIEW_TYPE);
  }

  installBoardCreationSupport() {
    const enhance = () => {
      document.querySelectorAll(".base-board-column").forEach((column) => {
        if (column.querySelector(".base-board-column-add-card-footer")) return;
        const footer = column.createDiv({ cls: "base-board-column-add-card-footer" });
        footer.createEl("button", {
          cls: "base-board-column-add-card-footer-button",
          text: "+ Add new item",
          attr: { type: "button", "aria-label": `Add new item to ${column.dataset.columnName || "column"}` }
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
      this.startBoardCardInput(column);
    }, true);
    const observer = new MutationObserver(enhance);
    observer.observe(this.app.workspace.containerEl, { childList: true, subtree: true });
    this.register(() => observer.disconnect());
    enhance();
  }

  startBoardCardInput(column) {
    const existing = column.querySelector(".rikka-board-card-input");
    if (existing) { existing.focus(); return; }
    const cards = column.querySelector(".base-board-cards");
    if (!cards) return;
    const wrapper = cards.createDiv({ cls: "base-board-add-card-input-wrapper rikka-board-input-wrapper" });
    const input = wrapper.createEl("input", {
      cls: "base-board-add-card-input rikka-board-card-input",
      attr: { type: "text", placeholder: "New item", "aria-label": "New card title", inputmode: "text", autocapitalize: "sentences", autocomplete: "off" }
    });
    let busy = false;
    const commit = async () => {
      if (busy || !input.value.trim()) return;
      busy = true;
      input.disabled = true;
      try {
        await this.createBoardCard(column, input.value.trim());
        wrapper.remove();
      } catch (error) {
        busy = false;
        input.disabled = false;
        new Notice(`Could not add item: ${error?.message || error}`);
        input.focus();
      }
    };
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.mobileDragClickSuppression = Date.now() + 1200;
        void commit();
      } else if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        wrapper.remove();
      }
    });
    input.focus({ preventScroll: true });
    wrapper.scrollIntoView({ block: "nearest", inline: "nearest" });
  }

  async createBoardCard(column, title) {
    let boardLeaf;
    this.app.workspace.iterateAllLeaves((leaf) => {
      if (leaf.view?.containerEl?.contains(column)) boardLeaf = leaf;
    });
    const statePath = boardLeaf?.view?.getState?.()?.file;
    const baseFile = boardLeaf?.view?.file || (statePath && this.app.vault.getAbstractFileByPath(statePath));
    if (!(baseFile instanceof TFile) || baseFile.extension !== "base") {
      throw new Error("Open the board as a page before adding an item.");
    }
    const definition = parseYaml(await this.app.vault.read(baseFile)) || {};
    const config = (definition.views || []).find((view) => view.type === "base-board");
    const groupProperty = (config?.groupBy?.property || "status").replace(/^note\./, "");
    const folder = config?.newItemFolder || baseFile.parent?.path || "";
    const safeTitle = title.replace(/[\\/:*?"<>|\u0000-\u001f]/g, " — ").replace(/\s+/g, " ").trim().slice(0, 160);
    if (!safeTitle) throw new Error("Enter a title for the item.");
    const orders = Array.from(column.querySelectorAll(".base-board-card[data-file-path]")).map((card) => {
      const file = this.app.vault.getAbstractFileByPath(card.dataset.filePath);
      return file && this.app.metadataCache.getFileCache(file)?.frontmatter?.kanban_order;
    });
    const keys = orders.filter((order) => typeof order === "string").sort();
    const numbers = orders.filter((order) => typeof order === "number" && Number.isFinite(order));
    const order = keys.length ? keys[keys.length - 1] + "V" : numbers.length ? Math.max(...numbers) + 1000 : 1000;
    const properties = { ...(config?.newItemProperties || {}), [groupProperty]: column.dataset.columnName, kanban_order: order };
    let path = `${folder ? folder + "/" : ""}${safeTitle}.md`;
    for (let suffix = 2; this.app.vault.getAbstractFileByPath(path); suffix++) {
      path = `${folder ? folder + "/" : ""}${safeTitle} ${suffix}.md`;
    }
    // Creating through the vault keeps Bases from opening the new note/properties.
    // The board refreshes from the normal vault event while its tab stays active.
    await this.app.vault.create(path, `---\n${stringifyYaml(properties)}---\n\n`);
  }

  installMobileBoardSupport() {
    if (!Platform.isMobile) return;
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
      for (const leaf of this.app.workspace.getLeavesOfType("base-board")) {
        const manager = leaf.view?.dragDropManager;
        const board = leaf.view?.containerEl?.querySelector(".base-board-board");
        if (!manager || !board || manager.__rikkaTouchBoard === board) continue;
        manager.__rikkaTouchCleanup?.();
        let state = null;
        let timer = 0;
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
          }, 120);
        };
        const onMove = (event) => {
          if (!state) return;
          const touch = Array.from(event.touches).find((item) => item.identifier === state.id);
          if (!touch) return;
          state.lastX = touch.clientX;
          state.lastY = touch.clientY;
          if (!state.active) {
            if (Math.hypot(touch.clientX - state.x, touch.clientY - state.y) > 18) clearPending();
            return;
          }
          event.preventDefault();
          const target = document.elementFromPoint(touch.clientX, touch.clientY);
          if (!target || !board.contains(target)) return;
          manager.updateAutoScroll(touch.clientX, touch.clientY, target);
          manager.handleCardDragOver({ target, clientX: touch.clientX, clientY: touch.clientY });
        };
        const onEnd = async (event) => {
          if (!state) return;
          window.clearTimeout(timer);
          timer = 0;
          const drag = state;
          state = null;
          if (!drag.active) return;
          this.mobileDragClickSuppression = Date.now() + 700;
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
        manager.__rikkaTouchCleanup = () => {
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
    this.mobileBoardObserver = new MutationObserver(attachTouchDrag);
    this.mobileBoardObserver.observe(this.app.workspace.containerEl, { childList: true, subtree: true });
    this.register(() => this.mobileBoardObserver?.disconnect());
    attachTouchDrag();
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

  refreshViews() {
    this.getView()?.render();
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
    state.wordTarget = Number.isFinite(Number(state.wordTarget)) && Number(state.wordTarget) > 0 ? Number(state.wordTarget) : 0;
    for (const key of Object.keys(DEFAULT_DATA)) this.data[key] = state[key];
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
      this.data.projectStates[id] = Object.assign({}, DEFAULT_DATA, { collapsed: {}, research: [], trash: [], collections: {}, templates: [], wordTarget: 0 });
      await this.selectProject(id);
      new Notice(`${folderName} is ready in LIFE2.0.`);
    }).open();
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
    await this.renameSnapshotSources(oldPath, newPath);
    await this.saveState();
  }

  async renameSnapshotSources(oldPath, newPath) {
    const snapshots = this.app.vault.getMarkdownFiles().filter((file) => file.path.startsWith("_Rikka/Snapshots/"));
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
    const remove = (paths) => paths.filter((path) => !this.pathIsWithin(path, deletedPath));
    this.data.research = remove(this.data.research);
    this.data.trash = remove(this.data.trash);
    this.data.templates = remove(this.data.templates);
    for (const name of Object.keys(this.data.collections)) this.data.collections[name] = remove(this.data.collections[name]);
    this.removeCollapsedPath(deletedPath);
    for (const path of this.wordCountCache.keys()) if (this.pathIsWithin(path, deletedPath)) this.wordCountCache.delete(path);
    await this.saveState();
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
    // Reuse the leftmost main-workspace tab for ordinary navigation, including
    // on mobile where the active leaf can be the Binder in the left sidebar.
    let firstLeaf = null;
    this.app.workspace.iterateRootLeaves((candidate) => {
      if (!firstLeaf) firstLeaf = candidate;
    });
    const leaf = split
      ? this.app.workspace.getLeaf("split", "vertical")
      : newTab
        ? this.app.workspace.getLeaf("tab")
        : firstLeaf || this.app.workspace.getLeaf(false);
    await leaf.openFile(file);
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

  async renderWordTarget(container) {
    container.empty();
    const words = await this.getDraftWordCount();
    const binder = container.closest(".rikka-binder");
    binder?.querySelectorAll(".rikka-note-row").forEach((row) => {
      const count = this.wordCountCache.get(row.dataset.path)?.words;
      if (!Number.isFinite(count) || row.querySelector(".rikka-row-wordcount")) return;
      row.createSpan({ cls: "rikka-row-wordcount", text: `${count.toLocaleString()}w` });
    });
    const target = Number(this.data.wordTarget) || 0;
    const label = container.createSpan({ cls: "rikka-target-label", text: target ? `${words.toLocaleString()} / ${target.toLocaleString()} words` : `${words.toLocaleString()} draft words` });
    label.setAttr("aria-live", "polite");
    if (target) {
      const track = container.createDiv({ cls: "rikka-target-track" });
      const fill = track.createDiv({ cls: "rikka-target-fill" });
      fill.style.width = `${Math.min(100, Math.round((words / target) * 100))}%`;
    }
    const button = container.createEl("button", { cls: "rikka-target-button", text: target ? "Edit target" : "Set target" });
    button.addEventListener("click", () => new RikkaNameModal(this.app, "Draft word target", "For example: 10000", async (value) => {
      const parsed = Number(value.replace(/,/g, "").trim());
      if (!Number.isSafeInteger(parsed) || parsed < 1) {
        new Notice("Enter a word target greater than zero.");
        return;
      }
      this.data.wordTarget = parsed;
      await this.saveState();
    }).open());
  }

  promptNewFromTemplate() {
    const templates = (this.data.templates || [])
      .map((path) => this.app.vault.getAbstractFileByPath(path))
      .filter((file) => file instanceof TFile);
    if (!templates.length) {
      new Notice("Right-click a document and choose Save as template first.");
      return;
    }
    const choices = templates.map((file) => ({ value: file.path, label: file.basename }));
    new RikkaChoiceModal(this.app, "New document from template", choices, async (path) => {
      const template = this.app.vault.getAbstractFileByPath(path);
      if (!(template instanceof TFile)) return;
      new RikkaNameModal(this.app, "Name the new document", "Document title", async (name) => {
        const safe = this.safeName(name);
        const targetPath = `${this.activeProject.path}/${safe}.md`;
        if (!safe || this.app.vault.getAbstractFileByPath(targetPath)) {
          new Notice("Enter a unique document name.");
          return;
        }
        const content = await this.app.vault.cachedRead(template);
        const created = await this.app.vault.create(targetPath, content);
        await this.openFile(created);
        this.refreshViews();
      }).open();
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

  async promptNewNote(folderPath = "") {
    new RikkaNameModal(this.app, "New document in Draft", "Document title", async (name) => {
      const safe = this.safeName(name);
      if (!safe) return;
      const path = folderPath ? `${folderPath}/${safe}.md` : `${this.activeProject.path}/${safe}.md`;
      if (this.app.vault.getAbstractFileByPath(path)) {
        new Notice("A document with that name already exists here.");
        return;
      }
      const file = await this.app.vault.create(path, "");
      await this.openFile(file);
      this.refreshViews();
    }).open();
  }

  async promptNewFolder(parentPath = "") {
    new RikkaNameModal(this.app, "New folder in Draft", "Folder name", async (name) => {
      const safe = this.safeName(name);
      if (!safe) return;
      const path = parentPath ? `${parentPath}/${safe}` : `${this.activeProject.path}/${safe}`;
      if (this.app.vault.getAbstractFileByPath(path)) {
        new Notice("A folder or document with that name already exists here.");
        return;
      }
      await this.app.vault.createFolder(path);
      this.refreshViews();
    }).open();
  }

  safeName(value) {
    return value.replace(/[\\/:*?"<>|]/g, "—").replace(/[. ]+$/g, "").trim();
  }

  async moveToCollection(path, collection) {
    if (!["draft", "research", "trash"].includes(collection)) return;
    this.data.research = this.data.research.filter((item) => item !== path);
    this.data.trash = this.data.trash.filter((item) => item !== path);
    if (collection !== "draft" && !this.data[collection].includes(path)) this.data[collection].push(path);
    await this.saveState();
  }

  showItemMenu(item, section, event) {
    const menu = new Menu();
    const safe = (action, label) => () => this.runSafely(action, label);
    if (item instanceof TFile) {
      menu.addItem((entry) => entry.setTitle("Open in new tab").setIcon("file-plus-2").onClick(safe(() => this.openFile(item, true), "Open in new tab")));
      menu.addItem((entry) => entry.setTitle("Open in right split").setIcon("columns-2").onClick(safe(() => this.openFile(item, false, true), "Open in split")));
      menu.addItem((entry) => entry.setTitle("Add to collection").setIcon("library").onClick(() => this.addToCollection(item)));
      menu.addSeparator();
      menu.addItem((entry) => entry.setTitle("Take snapshot").setIcon("history").onClick(safe(() => this.takeSnapshot(item), "Take snapshot")));
      menu.addItem((entry) => entry.setTitle("Compare with latest snapshot").setIcon("columns-2").onClick(safe(() => this.openLatestSnapshotBeside(item), "Compare snapshots")));
      if (item.extension === "md") {
      menu.addItem((entry) => entry.setTitle("Set status").setIcon("badge-check").onClick(() => {
        const choices = ["Draft", "Revised", "Final", "Needs work", "Research"].map((value) => ({ value, label: value }));
        new RikkaChoiceModal(this.app, `Status · ${item.basename}`, choices, (value) => this.setFileProperty(item, "rikka_status", value)).open();
      }));
      menu.addItem((entry) => entry.setTitle("Set color label").setIcon("paintbrush").onClick(() => {
        const choices = Object.keys(RIKKA_LABELS).map((value) => ({ value, label: value }));
        new RikkaChoiceModal(this.app, `Color label · ${item.basename}`, choices, (value) => this.setFileProperty(item, "rikka_label", value)).open();
      }));
      menu.addItem((entry) => entry.setTitle("Set document icon").setIcon("star").onClick(() => {
        const choices = [{ value: "", label: "Default" }, ...RIKKA_ICONS.map((value) => ({ value, label: value }))];
        new RikkaChoiceModal(this.app, `Document icon · ${item.basename}`, choices, (value) => this.setFileProperty(item, "rikka_icon", value)).open();
      }));
      const included = this.app.metadataCache.getFileCache(item)?.frontmatter?.rikka_include !== false;
      menu.addItem((entry) => entry.setTitle(included ? "Exclude from compile" : "Include in compile").setIcon(included ? "circle-minus" : "circle-check").onClick(() => this.setFileProperty(item, "rikka_include", included ? false : true)));
      menu.addItem((entry) => entry.setTitle("Edit synopsis").setIcon("align-left").onClick(() => {
        const synopsis = this.app.metadataCache.getFileCache(item)?.frontmatter?.rikka_synopsis || "";
        new RikkaTextModal(this.app, `Synopsis · ${item.basename}`, synopsis, (value) => this.setFileProperty(item, "rikka_synopsis", value)).open();
      }));
      const isTemplate = (this.data.templates || []).includes(item.path);
      menu.addItem((entry) => entry.setTitle(isTemplate ? "Remove from templates" : "Save as template").setIcon("files").onClick(() => this.runSafely(async () => {
        this.data.templates ||= [];
        this.data.templates = isTemplate ? this.data.templates.filter((path) => path !== item.path) : [...this.data.templates, item.path];
        await this.saveState();
        new Notice(isTemplate ? "Removed from templates." : "Saved as a reusable template.");
      }, isTemplate ? "Remove template" : "Save template")));
      menu.addItem((entry) => entry.setTitle("Clear Rikka labels").setIcon("x").onClick(safe(() => this.clearRikkaLabels(item), "Clear Rikka labels")));
      }
      menu.addSeparator();
    }
    if (section === "trash") {
      menu.addItem((entry) => entry.setTitle("Restore to Draft").setIcon("rotate-ccw").onClick(() => this.runSafely(() => this.moveToCollection(item.path, "draft"), "Restore document")));
    } else if (section === "research") {
      menu.addItem((entry) => entry.setTitle("Move to Draft").setIcon("file-text").onClick(() => this.runSafely(() => this.moveToCollection(item.path, "draft"), "Move to Draft")));
      menu.addItem((entry) => entry.setTitle("Move to Rikka Trash").setIcon("trash-2").onClick(() => this.runSafely(() => this.moveToCollection(item.path, "trash"), "Move to Rikka Trash")));
    } else if (section.startsWith("collection:")) {
      const name = section.slice("collection:".length);
      menu.addItem((entry) => entry.setTitle("Remove from collection").setIcon("list-minus").onClick(() => this.runSafely(() => this.removeFromCollection(name, item.path), "Remove from collection")));
      menu.addItem((entry) => entry.setTitle("Move to Rikka Trash").setIcon("trash-2").onClick(() => this.runSafely(() => this.moveToCollection(item.path, "trash"), "Move to Rikka Trash")));
    } else {
      if (item instanceof TFolder) {
        menu.addItem((entry) => entry.setTitle("New document inside").setIcon("file-plus-2").onClick(() => this.promptNewNote(item.path)));
        menu.addItem((entry) => entry.setTitle("New folder inside").setIcon("folder-plus").onClick(() => this.promptNewFolder(item.path)));
      }
      menu.addItem((entry) => entry.setTitle("Move to Research").setIcon("library").onClick(() => this.runSafely(() => this.moveToCollection(item.path, "research"), "Move to Research")));
      menu.addItem((entry) => entry.setTitle("Move to Rikka Trash").setIcon("trash-2").onClick(() => this.runSafely(() => this.moveToCollection(item.path, "trash"), "Move to Rikka Trash")));
    }
    menu.showAtMouseEvent(event);
  }
};
