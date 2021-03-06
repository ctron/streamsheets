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

/* eslint-disable react/prop-types, react/forbid-prop-types */
/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { FormGroup, TextField } from '@material-ui/core';
// import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import JSG from '@cedalo/jsg-ui';

import { graphManager } from '../../GraphManager';
import CellRangeComponent from './CellRangeComponent';
import {intl} from "../../helper/IntlGlobalProvider";
import MenuItem from "@material-ui/core/MenuItem";

function MyInputComponent(props) {
	const { inputRef, ...other } = props;

	// implement  `InputElement` interface
	React.useImperativeHandle(inputRef, () => ({
		focus: () => {}
	}));

	return <CellRangeComponent {...other} />;
}

export class GeometryProperties extends Component {
	state = {
		dummy: 0,
	}

	getSheetView() {
		const selection = graphManager.getGraphViewer().getSelection();
		if (selection === undefined || selection.length !== 1) {
			return undefined;
		}

		let controller = selection[0].getParent();
		while (controller && !(controller.getModel() instanceof JSG.StreamSheet)) {
			controller = controller.getParent();
		}

		return controller ? controller.getView() : undefined;
	}

	static getView() {
		const selection = graphManager.getGraphViewer().getSelection();
		if (selection === undefined || selection.length !== 1) {
			return undefined;
		}
		return selection[0].getView();
	}

	getSheet(item) {
		let ws = item.getParent();
		while (ws && !(ws instanceof JSG.StreamSheet)) {
			ws = ws.getParent();
		}

		return ws;
	}

	getFormula(expr, round) {
		const item = this.props.view.getItem();
		return expr.toLocaleString(JSG.getParserLocaleSettings(), {
			item: this.getSheet(item),
			useName: true,
			round
		});
	}

	getExpression(item, event) {
		return this.getSheet(item).textToExpression(String(event.target.textContent), item);
	}

	getAttributeHandler(label, item, name, round = 0) {
		const sheetView = this.getSheetView();

		return (
			<TextField
				variant="outlined"
				size="small"
				margin="normal"
				label={intl.formatMessage({ id: label })}
				onBlur={(event) => this.handleAttribute(event, item, name)}
				InputLabelProps={{shrink: true}}
				InputProps={{
					inputComponent: MyInputComponent,
					inputProps: {
						component: CellRangeComponent,
						sheetView,
						range: this.getFormula(item.getAttributeAtPath(name).getExpression(), round)
					}
				}}
			/>
		)
	}

	getPropertyHandler(label, handler, expression, round = 0) {
		const sheetView = this.getSheetView();

		return (
			<TextField
				key={label}
				variant="outlined"
				size="small"
				margin="normal"
				label={intl.formatMessage({ id: label })}
				onBlur={(event) => handler(event)}
				InputLabelProps={{shrink: true}}
				InputProps={{
					inputComponent: MyInputComponent,
					inputProps: {
						onlyReference: false,
						component: CellRangeComponent,
						sheetView,
						range: this.getFormula(expression, round)
					}
				}}
			/>
		)
	}

	handleAttribute(event, item, name) {
		const expr = this.getExpression(item, event);
		const cmd = new JSG.SetAttributeAtPathCommand(item, name, expr.expression);

		graphManager.synchronizedExecute(cmd);
	}

	handleX = (event) => {
		const item = this.props.view.getItem();
		const expr = this.getExpression(item, event).expression;
		const line = item.getShape().getType() === JSG.LineShape.TYPE;
		let cmd;

		if (line) {
			const startCoor = item.getStartCoordinate();

			if (expr.hasFormula()) {
				startCoor.setX(expr);
			} else {
				const point = new JSG.Point(expr.getValue(), 0);
				item.translateFromParent(point);
				startCoor.setX(new JSG.NumberExpression(point.x));
			}

			cmd = new JSG.SetLineCoordinateAtCommand(item, 0, startCoor);
		} else {
			item.getPin().setX(expr);
			cmd = new JSG.SetPinCommand(item, item.getPin());
		}

		graphManager.synchronizedExecute(cmd);
	}

	handleY = (event) => {
		const item = this.props.view.getItem();
		const expr = this.getExpression(item, event).expression;
		const line = item.getShape().getType() === JSG.LineShape.TYPE;
		let cmd;

		if (line) {
			const startCoor = item.getStartCoordinate();

			if (expr.hasFormula()) {
				startCoor.setY(expr);
			} else {
				const point = new JSG.Point(0, expr.getValue());
				item.translateFromParent(point);
				startCoor.setY(new JSG.NumberExpression(point.y));
			}

			cmd = new JSG.SetLineCoordinateAtCommand(item, 0, startCoor);
		} else {
			item.getPin().setY(expr);
			cmd = new JSG.SetPinCommand(item, item.getPin());
		}

		graphManager.synchronizedExecute(cmd);
	}

	handleWidth = (event) => {
		const item = this.props.view.getItem();
		const expr = this.getExpression(item, event).expression;
		const line = item.getShape().getType() === JSG.LineShape.TYPE;
		let cmd;

		if (line) {
			const endCoor = item.getEndCoordinate();

			if (expr.hasFormula()) {
				endCoor.setX(expr);
			} else {
				const point = new JSG.Point(expr.getValue(), 0);
				item.translateFromParent(point);
				endCoor.setX(new JSG.NumberExpression(point.x));
			}

			cmd = new JSG.SetLineCoordinateAtCommand(item, 1, endCoor);
		} else {
			cmd = new JSG.SetSizeCommand(item, new JSG.Size(expr, item.getHeight()));
		}
		graphManager.synchronizedExecute(cmd);
	}

	handleHeight = (event) => {
		const item = this.props.view.getItem();
		const expr = this.getExpression(item, event).expression;
		const line = item.getShape().getType() === JSG.LineShape.TYPE;
		let cmd;

		if (line) {
			const endCoor = item.getEndCoordinate();

			if (expr.hasFormula()) {
				endCoor.setY(expr);
			} else {
				const point = new JSG.Point(0, expr.getValue());
				item.translateFromParent(point);
				endCoor.setY(new JSG.NumberExpression(point.y));
			}

			cmd = new JSG.SetLineCoordinateAtCommand(item, 1, endCoor);
		} else {
			cmd = new JSG.SetSizeCommand(item, new JSG.Size(item.getWidth(), expr));
		}
		graphManager.synchronizedExecute(cmd);
	}

	handleRotation = (event) => {
		const item = this.props.view.getItem();
		const expr = this.getExpression(item, event);
		const cmd = new JSG.RotateItemCommand(item, expr.expression);
		graphManager.synchronizedExecute(cmd);
	}

	handleRotationCenter = (event) => {
		const item = this.props.view.getItem();
		const pin = item.getPin();
		const local = pin.getLocalPoint();

		switch (event.target.value) {
			case '0':
				pin.setLocalCoordinate(new JSG.NumberExpression(0), new JSG.NumberExpression(0));
				pin.evaluate();
				break;
			case '1':
				pin.setLocalCoordinate(
					new JSG.NumberExpression(local.x, 'WIDTH * 0.5'),
					new JSG.NumberExpression(0)
				);
				break;
			case '2':
				pin.setLocalCoordinate(new JSG.NumberExpression(local.x, 'WIDTH'), new JSG.NumberExpression(0));
				break;
			case '3':
				pin.setLocalCoordinate(
					new JSG.NumberExpression(0),
					new JSG.NumberExpression(local.y, 'HEIGHT * 0.5')
				);
				break;
			default:
			case '4':
				pin.setLocalCoordinate(
					new JSG.NumberExpression(local.x, 'WIDTH * 0.5'),
					new JSG.NumberExpression(local.y, 'HEIGHT * 0.5')
				);
				break;
			case '5':
				pin.setLocalCoordinate(
					new JSG.NumberExpression(local.x, 'WIDTH'),
					new JSG.NumberExpression(local.y, 'HEIGHT * 0.5')
				);
				break;
			case '6':
				pin.setLocalCoordinate(new JSG.NumberExpression(0), new JSG.NumberExpression(local.y, 'HEIGHT'));
				break;
			case '7':
				pin.setLocalCoordinate(
					new JSG.NumberExpression(local.x, 'WIDTH * 0.5'),
					new JSG.NumberExpression(local.y, 'HEIGHT')
				);
				break;
			case '8':
				pin.setLocalCoordinate(
					new JSG.NumberExpression(local.x, 'WIDTH'),
					new JSG.NumberExpression(local.y, 'HEIGHT')
				);
				break;
		}

		const cmd = new JSG.SetPinCommand(item, pin);

		graphManager.synchronizedExecute(cmd);
		this.setState({
			dummy: Math.random()
		})
	}

	handlePointRange = (event) => {
		const item = this.props.view.getItem();
		const expr = this.getExpression(item, event);
		const cmd = new JSG.SetPointSourceCommand(item, expr.expression);
		graphManager.synchronizedExecute(cmd);
	}

	handleText = (event) => {
		const item = this.props.view.getItem();
		const expr = this.getExpression(item, event);
		const cmd = new JSG.SetTextCommand(item, item.getText(), expr.expression);
		graphManager.synchronizedExecute(cmd);
	}

	getX() {
		const item = this.props.view.getItem();
		const type = item.getShape().getType();
		let ret;

		if (type === JSG.LineShape.TYPE) {
			const coor = item.getStartCoordinate();
			ret = coor.getX().hasFormula() ? coor.getX() : new JSG.NumberExpression(item.getStartPoint().x);
		} else {
			ret = item.getPin().getX();
		}

		return ret;
	}

	getY() {
		const item = this.props.view.getItem();
		const type = item.getShape().getType();
		let ret;

		if (type === JSG.LineShape.TYPE) {
			const coor = item.getStartCoordinate();
			ret = coor.getY().hasFormula() ? coor.getY() : new JSG.NumberExpression(item.getStartPoint().y);
		} else {
			ret = item.getPin().getY();
		}

		return ret;
	}

	getWidth() {
		const item = this.props.view.getItem();
		const type = item.getShape().getType();
		let ret;

		if (type === JSG.LineShape.TYPE) {
			const coor = item.getEndCoordinate();
			ret = coor.getX().hasFormula() ? coor.getX() : new JSG.NumberExpression(item.getEndPoint().x);
		} else {
			ret = item.getWidth();
		}

		return ret;
	}

	getHeight() {
		const item = this.props.view.getItem();
		const type = item.getShape().getType();
		let ret;

		if (type === JSG.LineShape.TYPE) {
			const coor = item.getEndCoordinate();
			ret = coor.getY().hasFormula() ? coor.getY() : new JSG.NumberExpression(item.getEndPoint().y);
		} else {
			ret = item.getHeight();
		}

		return ret;
	}

	getRotationCenter() {
		const item = this.props.view.getItem();
		const pin = item.getPin();
		const x = pin.getLocalX().getFormula();
		const y = pin.getLocalY().getFormula();
		let ret = 4;

		if (x === undefined) {
			if (y === undefined) {
				ret = 0;
			} else if (y === 'HEIGHT * 0.5') {
				ret = 3;
			} else {
				ret = 6;
			}
		} else if (x === 'WIDTH * 0.5') {
			if (y === undefined) {
				ret = 1;
			} else if (y === 'HEIGHT * 0.5') {
				ret = 4;
			} else {
				ret = 7;
			}
		} else if (y === undefined) {
			ret = 2;
		} else if (y === 'HEIGHT * 0.5') {
			ret = 5;
		} else {
			ret = 8;
		}

		return ret;
	}

	render() {
		const sheetView = this.getSheetView();
		if (!sheetView) {
			return <div />;
		}
		const item = this.props.view.getItem();
		const line = item.getShape().getType() === JSG.LineShape.TYPE;
		return (
			<FormGroup>
				{this.getPropertyHandler(line ? "GraphItemProperties.StartX" : "GraphItemProperties.HorizontalPosition", this.handleX, this.getX())}
				{this.getPropertyHandler(line ? "GraphItemProperties.StartY" : "GraphItemProperties.VerticalPosition", this.handleY, this.getY())}
				{this.getPropertyHandler(line ? "GraphItemProperties.EndX" : "GraphItemProperties.Width", this.handleWidth, this.getWidth())}
				{this.getPropertyHandler(line ? "GraphItemProperties.EndY" : "GraphItemProperties.Height", this.handleHeight, this.getHeight())}
				{line ? null : this.getPropertyHandler("GraphItemProperties.Rotation", this.handleRotation, item.getAngle(), 2)}
				{line ? null : (
					<TextField
						variant="outlined"
						size="small"
						margin="normal"
						select
						value={this.getRotationCenter()}
						onChange={event => this.handleRotationCenter(event)}
						label={
							<FormattedMessage id="GraphItemProperties.RotationCenter" defaultMessage="Rotation Center" />
						}
					>
						<MenuItem value="0">
							<FormattedMessage id="GraphItemProperties.LeftTop" defaultMessage="Left Top"/>
						</MenuItem>
						<MenuItem value="1">
							<FormattedMessage id="GraphItemProperties.CenterTop" defaultMessage="Left Top"/>
						</MenuItem>
						<MenuItem value="2">
							<FormattedMessage id="GraphItemProperties.RightTop" defaultMessage="Left Top"/>
						</MenuItem>
						<MenuItem value="3">
							<FormattedMessage id="GraphItemProperties.LeftMiddle" defaultMessage="Left Top"/>
						</MenuItem>
						<MenuItem value="4">
							<FormattedMessage id="GraphItemProperties.Center" defaultMessage="Left Top"/>
						</MenuItem>
						<MenuItem value="5">
							<FormattedMessage id="GraphItemProperties.RightMiddle" defaultMessage="Left Top"/>
						</MenuItem>
						<MenuItem value="6">
							<FormattedMessage id="GraphItemProperties.LeftBottom" defaultMessage="Left Top"/>
						</MenuItem>
						<MenuItem value="7">
							<FormattedMessage id="GraphItemProperties.CenterBottom" defaultMessage="Left Top"/>
						</MenuItem>
						<MenuItem value="8">
							<FormattedMessage id="GraphItemProperties.RightBottom" defaultMessage="Left Top"/>
						</MenuItem>
					</TextField>
				)}
				{item.getShape() instanceof JSG.PolygonShape ? (
					this.getPropertyHandler("GraphItemProperties.PointRange", this.handlePointRange, item.getShape().getSource())
				) : null}
				{item instanceof JSG.TextNode ? (
					this.getPropertyHandler("GraphItemProperties.Text", this.handleText, item.getText())
				) : null}
				{(item instanceof JSG.SheetButtonNode) ||
				(item instanceof JSG.SheetSliderNode) ||
				(item instanceof JSG.SheetKnobNode) ||
				(item instanceof JSG.SheetCheckboxNode) ? [
					this.getAttributeHandler("GraphItemProperties.Title", item, 'title'),
					this.getAttributeHandler("GraphItemProperties.Value", item, 'value'),
				] : null}
				{(item instanceof JSG.SheetKnobNode) ||
				(item instanceof JSG.SheetSliderNode) ? [
					this.getAttributeHandler("GraphItemProperties.Minimum", item, 'min', -1),
					this.getAttributeHandler("GraphItemProperties.Maximum", item, 'max', -1),
					this.getAttributeHandler("GraphItemProperties.Step", item, 'step', -1),
					this.getAttributeHandler("GraphItemProperties.Marker", item, 'marker'),
					this.getAttributeHandler("GraphItemProperties.FormatRange", item, 'formatrange'),
				] : null}
				{(item instanceof JSG.SheetKnobNode) ? [
					this.getAttributeHandler("GraphItemProperties.StartAngle", item, 'start', 2),
					this.getAttributeHandler("GraphItemProperties.EndAngle", item, 'end', 2),
				] : null}
			</FormGroup>
		);
	}
}

export default GeometryProperties;
