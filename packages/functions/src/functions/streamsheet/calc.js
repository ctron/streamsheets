/********************************************************************************
 * Copyright (c) 2020 Cedalo AG
 *
 * This program and the accompanying materials are made available under the 
 * terms of the Eclipse Public License 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * SPDX-License-Identifier: EPL-2.0
 *
 ********************************************************************************/
const { FunctionErrors } = require('@cedalo/error-codes');
const { runFunction, sheet: sheetutils } = require('../../utils');

const ERROR = FunctionErrors.code;

const calc = (sheet, ...terms) => runFunction(sheet, terms).withArgCount(0).run(() => {
	// should not be used directly in cell:
	const cell = sheetutils.cellFromFunc(calc);
	return cell ? ERROR.INVALID : sheet._startProcessing();
});

module.exports = calc;
