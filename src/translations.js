#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import glob from 'glob';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import { ignoreTypes, ignoreFns, attributesToExtract } from './constants.js';

export const extractor = (params) => {
    // 初始化一个对象来存储所有提取的文本
    let translations = {};
    // 指定项目的目录和输出目录
    const pwd = process.env.PWD;
    const dir = path.join(pwd, params.srcDir || 'src');

    const outputDir = path.join(pwd, 'locales');
    const outputFile = path.join(outputDir, 'en.json');

    const fns = params.fns || ignoreFns;

    const isInsideI18nCall = (path) => {
        // console.log('path.node.callee: ', path.node.callee);
        while (path) {
            // if (path.type === 'BinaryExpression') return true;
            // if (path.type === 'ObjectProperty') return true;
            // if (path.type === 'TSEnumMember') return true;
            // if (path.type === 'ExportNamedDeclaration') return true;
            // if (path.type === 'JSXAttribute') return true;
            // if (path.type === 'MemberExpression' && !path.callee) {
            //   return true;
            // }
            if (
                path.type === 'CallExpression' &&
                path.callee?.type === 'Identifier' &&
                fns.includes(path.callee?.name)
            ) {
                return true;
            }
            path = path.parentPath;
        }
        return false;
    };

    const getPropValue = (variableName, path) => {
        // 假设父组件传递的prop是字符串字面量
        const propPath = path.findParent((p) => p.isJSXOpeningElement());
        if (propPath) {
            const prop = propPath.node.attributes.find(
                (attr) => attr.name && attr.name.name === variableName
            );
            if (prop && prop.value && prop.value.type === 'StringLiteral') {
                return prop.value.value;
            }
        }
        return null;
    };

    const addTranslation = (file, text) => {
        const relativePath = path.relative(dir, file);
        if (!translations[relativePath]) {
            translations[relativePath] = {};
        }
        translations[relativePath][text] = text;
    };
    // 递归搜索src目录下的所有JavaScript/JSX文件
    glob(`${dir}/**/*.{js,jsx,ts,tsx}`, (err, files) => {
        if (err) {
            console.error('Error while searching for files:', err);
            return;
        }
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const code = fs.readFileSync(file, 'utf-8');
            const ast = parser.parse(code, {
                sourceType: 'module',
                plugins: ['jsx', 'typescript'],
            });

            let variables = {};
            let props = {};

            // 收集变量声明
            traverse.default(ast, {
                VariableDeclarator(path) {
                    if (path.node.init) {
                        if (path.node.init.type === 'StringLiteral') {
                            variables[path.node.id.name] = path.node.init.value;
                        } else if (path.node.init.type === 'ArrayExpression') {
                            variables[path.node.id.name] =
                                path.node.init.elements
                                    .filter((el) => el.type === 'StringLiteral')
                                    .map((el) => el.value);
                        }
                    }
                },
                AssignmentExpression(path) {
                    if (path.node.right) {
                        if (path.node.right.type === 'StringLiteral') {
                            if (path.node.left.type === 'Identifier') {
                                variables[path.node.left.name] =
                                    path.node.right.value;
                            }
                        } else if (path.node.right.type === 'ArrayExpression') {
                            if (path.node.left.type === 'Identifier') {
                                variables[path.node.left.name] =
                                    path.node.right.elements
                                        .filter(
                                            (el) => el.type === 'StringLiteral'
                                        )
                                        .map((el) => el.value);
                            }
                        }
                    }
                },
                FunctionDeclaration(path) {
                    const params = path.node.params;
                    if (
                        params.length > 0 &&
                        params[0].type === 'ObjectPattern'
                    ) {
                        params[0].properties.forEach((prop) => {
                            if (prop.value?.type === 'Identifier') {
                                props[prop.value.name] = true;
                            }
                        });
                    }
                },
                ArrowFunctionExpression(path) {
                    const params = path.node.params;
                    if (
                        params.length > 0 &&
                        params[0].type === 'ObjectPattern'
                    ) {
                        // debugger;
                        params[0].properties.forEach((prop) => {
                            if (prop.value?.type === 'Identifier') {
                                props[prop.value.name] = true;
                            }
                        });
                    }
                },
            });

            // debugger;
            // debugger;
            traverse.default(ast, {
                // ObjectProperty(path) {
                //   path.stop();
                //   return false;
                // },
                // JSXExpressionContainer(path) {
                //   // debugger;
                //   if (path.parent.type !== 'JSXAttribute') {
                //     debugger;
                //   }
                //   console.log(333);
                // },
                JSXText(path) {
                    const text = path.node.value.trim();
                    // if (text === 'young adult') {
                    //   debugger;
                    // }
                    if (
                        text &&
                        !isInsideI18nCall(path) &&
                        !ignoreTypes.includes(path.parent.type)
                    ) {
                        addTranslation(file, text);
                    }
                },
                StringLiteral(path) {
                    // const text = path.node.value.trim();
                    // if (text === 'Set the default output language for all copy generation results on the platform.') {
                    //   debugger;
                    // }
                    // if (text === 'young adult') {
                    //   debugger;
                    // }
                    // if (text && !isInsideI18nCall(path.parent) && !ignoreTypes.includes(path.parent.type)) {
                    //   translations.text[text] = text;
                    // }
                    // 确保 StringLiteral 是在 JSXExpressionContainer 中并且不是属性值
                    if (
                        path.parentPath.isJSXExpressionContainer() &&
                        !path.findParent((p) => p.isJSXAttribute())
                    ) {
                        const text = path.node.value.trim();
                        if (text && !isInsideI18nCall(path)) {
                            addTranslation(file, text);
                        }
                    }
                },
                // TemplateLiteral(path) {
                //   const text = path.node.quasis.reduce((acc, cur, index) => {
                //     if (path.node.quasis.length <= index + 1) {
                //       return acc + cur.value.cooked;
                //     }
                //     return acc + cur.value.cooked + `$\{${index}}`;
                //   }, '');
                //   if (text && !isInsideI18nCall(path.parent) && !ignoreTypes.includes(path.parent.type)) {
                //     translations.template[text] = text;
                //   }
                // },
                JSXExpressionContainer(path) {
                    const expression = path.node.expression;
                    if (
                        expression.type === 'Identifier' &&
                        !path.findParent((p) => p.isJSXAttribute())
                    ) {
                        const variableName = expression.name;
                        const text =
                            variables[variableName] ||
                            getPropValue(variableName, path);
                        if (Array.isArray(text)) {
                            text.forEach((item) => {
                                addTranslation(file, item.trim());
                            });
                        } else if (
                            text &&
                            typeof text === 'string' &&
                            !isInsideI18nCall(path)
                        ) {
                            addTranslation(file, text.trim());
                            // translations[text.trim()] = text.trim();
                        }
                    } else if (
                        expression.type === 'MemberExpression' &&
                        expression.object.type === 'Identifier'
                    ) {
                        const arrayName = expression.object.name;
                        const arrayIndex = expression.property.value;
                        if (
                            variables[arrayName] &&
                            Array.isArray(variables[arrayName])
                        ) {
                            const text = variables[arrayName][arrayIndex];
                            if (text && !isInsideI18nCall(path)) {
                                addTranslation(file, text.trim());
                                // translations[text.trim()] = text.trim();
                            }
                        }
                    }
                },
                CallExpression(path) {
                    const callee = path.node.callee;
                    if (
                        callee.type === 'MemberExpression' &&
                        callee.property.name === 'map'
                    ) {
                        const arrayName = callee.object.name;
                        if (
                            variables[arrayName] &&
                            Array.isArray(variables[arrayName])
                        ) {
                            variables[arrayName].forEach((item) => {
                                if (
                                    item &&
                                    typeof item === 'string' &&
                                    !isInsideI18nCall(path)
                                ) {
                                    addTranslation(file, item.trim());
                                }
                            });
                        }
                    }
                },
                JSXAttribute(path) {
                    const attributeName = path.node.name.name;
                    if (
                        attributesToExtract.includes(attributeName) &&
                        path.node.value.type === 'StringLiteral'
                    ) {
                        const text = path.node.value.value.trim();
                        if (text && !isInsideI18nCall(path)) {
                            addTranslation(file, text);
                        }
                    }
                },
            });
        }

        // 如果输出目录不存在，则创建
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        // 将提取的文本写入JSON文件
        fs.writeFileSync(
            outputFile,
            JSON.stringify(translations, null, 2),
            'utf-8'
        );
        console.log(`Translations have been extracted to ${outputFile}`);
    });
};
