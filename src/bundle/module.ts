import {
	existsSync,
	lstatSync,
	readFileSync,
} from 'fs'

import {
	CallExpression,
	Node,
	parse as parseLua,
	StringCallExpression,
} from 'luaparse'

import {BUNDLED_REQUIRE} from '../runtime'

type RequiredModule = {
	name: string,
	resolvedPath: string,
}

export type RequireExpression = CallExpression | StringCallExpression

export type Module = {
	name: string,
	resolvedPath: string,
	content?: string,
}

export type ModuleMap = {
	[name: string]: Module,
}

export type NonLiteralRequire = {
	expression: RequireExpression,
	filePath: string,
}

const traverseRequires = (node: Node, callback: (expression: RequireExpression) => void) => {
	const anyNode = node as any
	const children = anyNode.body
		|| anyNode.clauses
		|| anyNode.init
		|| (anyNode.expression ? [anyNode.expression] : [])

	for (let i = children.length - 1; i >= 0; i--) {
		traverseRequires(children[i], callback)
	}

	if (node.type === 'CallExpression' || node.type === 'StringCallExpression') {
		const callExpression = node as RequireExpression
		if (callExpression.base.type === 'Identifier'
			&& callExpression.base.name === 'require'
			&& ((callExpression as StringCallExpression).argument || (callExpression as CallExpression).arguments?.length === 1)) {
			callback(callExpression)
		}
	}
}

function resolveModule(name: string, packagePaths: string[]) {
	for (const pattern of packagePaths) {
		const path = pattern.replace(/\?/g, name)

		if (existsSync(path) && lstatSync(path).isFile()) {
			return path
		}
	}
	return null
}

export function processModule(name: string, filePath: string, paths: string[], processedModules: ModuleMap, nonLiterals: NonLiteralRequire[]): void {
	const fileContent = readFileSync(filePath, 'utf8')

	const ast = parseLua(fileContent, {ranges: true})
	let processedContent = fileContent

	const discoveredModules: Module[] = []

	traverseRequires(ast, expression => {
		const argument = (expression as StringCallExpression).argument || (expression as CallExpression).arguments[0]

		if (argument.type === 'StringLiteral') {
			const requiredName = argument.value
			const resolvedPath = resolveModule(requiredName, paths)

			if (!resolvedPath) {
				throw new Error(`Could not resolve ${requiredName} required by ${filePath}`)
			}

			if (!processedModules[requiredName]) {
				discoveredModules.push({
					name: requiredName,
					resolvedPath,
				})
			}

			processedContent = processedContent.slice(0, (expression as any).range[0]) + BUNDLED_REQUIRE + '("' + requiredName + '")' + processedContent.slice((expression as any).range[1])
		} else {
			processedContent = processedContent.slice(0, (expression.base as any).range[0]) + BUNDLED_REQUIRE + processedContent.slice((expression.base as any).range[1])

			nonLiterals.push({
				expression,
				filePath,
			})
		}
	})

	processedModules[name] = {
		name,
		resolvedPath: filePath,
		content: processedContent,
	}

	for (const module of discoveredModules) {
		processModule(module.name, module.resolvedPath, paths, processedModules, nonLiterals)
	}
}
