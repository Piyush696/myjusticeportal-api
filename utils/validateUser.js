
module.exports = {
    validate: function (roleIds, role, callback) {
        console.log(roleIds, role)
        let z = [];
        z = role.map((x) => {
            if (roleIds.includes(x.roleId)) {
                return x.roleId
            }
        }).filter(r => r)
        if (z.length > 0) {
            callback(true);
        }
        else {
            callback(false);
        }
    }

}