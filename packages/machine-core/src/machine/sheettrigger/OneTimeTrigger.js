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
const BaseTrigger = require('./BaseTrigger');

// FOR DEBUGGING PURPOSE ONLY
class OneTimeTrigger extends BaseTrigger {
	constructor(cfg = {}) {
		super(Object.assign({}, cfg, { type: OneTimeTrigger.TYPE }));
		this._isTriggered = false;
	}

	step() {
		if (!this._isTriggered) {
			this._isTriggered = true;
			this.streamsheet.stats.steps += 1;
			this.processSheet();
		}
	}
}
OneTimeTrigger.TYPE = 'once';

module.exports = OneTimeTrigger;
