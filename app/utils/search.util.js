const { Op, where, col, cast } = require('sequelize');

//ตั้งค่าเงื่อนไขในการเสิชข้อมูล
exports.setSearchCondition = (col_name, data) => {
    //ถ้าไม่มีการส่ง params มา
    if (!col_name || !data) {
        return {};
    }
    //เช็คการเสิชที่เป็นตัวเลข
    const isNumberSearch = !isNaN(Number(data));

    //หากเป็นเลข
    if (isNumberSearch) {
        return where(
            cast(col(col_name), 'TEXT'),
            { [Op.iLike]: `%${data}%` }
        );
    }
    //หากเป็น string 
    else {
        return { [col_name]: { [Op.iLike]: `%${data}%` } };
    }
}

