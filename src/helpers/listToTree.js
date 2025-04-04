// create Tree Array

/* Converting a flat list to a tree. */
// var list = [{
//     "id": "12",
//     "parentId": "0",
//     "text": "Man",
//     "children": null
// }, {
//     "id": "6",
//     "parentId": "12",
//     "text": "Boy",
//     "children": null
// }, {
//     "id": "7",
//     "parentId": "12",
//     "text": "Other",
//     "children": null
// }, {
//     "id": "9",
//     "parentId": "0",
//     "text": "Woman",
//     "description": "nothing",
//     "children": null
// }, {
//     "id": "11",
//     "parentId": "9",
//     "text": "Girl",
//     "children": null
// }];

// var tree = listToTree(list, {
//     idKey: 'id',
//     parentKey: 'parentId',
//     childrenKey: 'children'
// });

// console.log(JSON.stringify(tree, null, " "));



module.exports = (data, options) => {
    options = options || {};
    var ID_KEY = options.idKey || 'id';
    var PARENT_KEY = options.parentKey || 'parent';
    var CHILDREN_KEY = options.childrenKey || 'children';

    var tree = [],
        childrenOf = {};
    var item, id, parentId;

    for (var i = 0, length = data.length; i < length; i++) {
        item = data[i];
        id = item[ID_KEY];
        parentId = item[PARENT_KEY] || 0;
        // every item may have children
        childrenOf[id] = childrenOf[id] || [];
        // init its children
        item[CHILDREN_KEY] = childrenOf[id];
        if (parentId != 0) {
            // init its parent's children object
            childrenOf[parentId] = childrenOf[parentId] || [];
            // push it into its parent's children object
            childrenOf[parentId].push(item);
        } else {
            tree.push(item);
        }
    };
    return tree;
}