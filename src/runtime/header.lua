local __bundled_module, __bundled_require, __bundled_loaded = (function()
	local globalRequire = require
	local loadingPlaceholder = {[{}] = true}

	local entryPoints = {}
	local loaded = {}

	local function copyTable(tab)
		local copied = {}
		for k, v in pairs(tab) do
			copied[k] = v
		end
		return copied
	end

	local function module(name, body)
		if not entryPoints[name] then
			entryPoints[name] = body
		end
	end

	local function require(name)
		local loadedModule = loaded[name]

		if loadedModule then
			if loadedModule == loadingPlaceholder then
				return nil
			end
		else
			if not entryPoints[name] then
				if not globalRequire then
					error('Tried to require \"' .. name .. '\", but no such module has been registered')
				else
					return globalRequire(name)
				end
			end

			loaded[name] = loadingPlaceholder
			loadedModule = entryPoints[name](copyTable(_ENV))
			loaded[name] = loadedModule
		end

		return loadedModule
	end

	return module, require, loaded
end)()
