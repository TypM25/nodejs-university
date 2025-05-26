const { Op, where, col, cast , literal } = require('sequelize');

exports.setSearchCondition = (col_name, data) => {
    if (!col_name || !data) {
        return {};
    }

    const isNumberSearch = !isNaN(Number(data));

    if (isNumberSearch) {
        return where(
            cast(col(col_name), 'TEXT'),
            { [Op.iLike]: `%${data}%` }
        );
    } else {
        return { [col_name]: { [Op.iLike]: `%${data}%` } };
    }
}

