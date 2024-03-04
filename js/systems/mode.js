import { modeFolder } from "./gui.js";
import { deselectModel } from "../content/models.js";
import { deselectObject } from "./control.js";
import brush from "../content/brush.js";

export let mode = 
{
    selected: 0,
    fixRotateAngle: true,

    setEditTerrainMode ()
    {
        this.selected = 0;

        editTerrainButton.name("Редактирование ландшафта (активен)");
        selectObjectesButton.name("Взаимодействие с объектами сцены");

        deselectModel();
        deselectObject();

        brush.border.visible = true;
    },

    setSelectObjectMode ()
    {
        this.selected = 1;

        editTerrainButton.name("Редактирование ландшафта");
        selectObjectesButton.name("Взаимодействие с объектами сцены (выбрано)");

        deselectModel();

        brush.border.visible = false;

        alert("Используйте клавиши Q/E, чтобы вращать выбранный объект \n"
            + "Используйте колёсико мыши, чтобы изменить размер выбранного объекта \n"
            + "Используйте клавишу \'delete\', чтобы удалить выбранный объект");
    },

    setAddObjectMode ()
    {
        this.selected = 2;

        editTerrainButton.name("Редактирование ландшафта");
        selectObjectesButton.name("Взаимодействие с объектами сцены");

        deselectObject();

        brush.visible = false;
    },
}

let editTerrainButton = modeFolder.add(mode, 'setEditTerrainMode').name('Редактирование ландшафта (активен)');
let selectObjectesButton = modeFolder.add(mode, 'setSelectObjectMode').name('Взаимодействие с объектами сцены');
modeFolder.add(mode, 'fixRotateAngle').name('Поворачивать на 45°');