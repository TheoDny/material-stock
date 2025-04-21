export type PermissionSeed = {
    code: string;    
}
/*
user_create, user_read, user_edit
role_create, role_read, role_edit
tag_create,tag_read, tag_edit
charac_create, charac_edit, charac_read
*/
export const permissions = [
    { code: "user_create" },
    { code: "user_read" },
    { code: "user_edit" },
    { code: "role_create" },
    { code: "role_read" },
    { code: "role_edit" },
    { code: "log_read" },
    { code: "tag_create" },
    { code: "tag_read" },
    { code: "tag_edit" },
    { code: "charac_create" },
    { code: "charac_read" },
    { code: "charac_edit" },
    { code: "material_create" },
    { code: "material_read" },
    { code: "material_edit" },
]