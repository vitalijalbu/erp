"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useValidationErrors } from "@/hooks/validation-errors";
import {
	Row,
	Col,
	Button,
	Space,
	Typography,
	Form,
	Input,
	Modal,
	Spin,
	Skeleton,
	message,
} from "antd";
import { IconChevronLeft, IconStar, IconTrash } from "@tabler/icons-react";
const { Text, Title } = Typography;

const PageActions = (props) => {
	const router = useRouter();
	const { path } = router.query;
	const [popupCategory, setPopupCategory] = useState(null);
	const [is_favorited, setFavorited] = useState(false);
	const [isSticky, setIsSticky] = useState(false);
	/* Toggle Favorite Popup
  const toggleCategoryPopup = () => {
    setPopupCategory(!popupCategory);
    setFavorited(true);
  };

  const handleScroll = () => {
    const scrollY = window.scrollY || window.pageYOffset;

    if (scrollY >= 60) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);*/

	return (
		<Skeleton
			paragraph={false}
			loading={props.loading}
		>
			{/*popupCategory && <PopupFavorite opened={popupCategory} toggle={toggleCategoryPopup} />*/}
			<div className={`page-heading mb-1`}>
				<Row
					align="middle"
					justify="space-between"
					key={`row-` + 0}
				>
					<Col key={`col-` + 0}>
						<Space align="start">
							{props.backUrl && (
								<Link href={props.backUrl}>
									<Button icon={<IconChevronLeft className="anticon" />} />
								</Link>
							)}
							<div>
								<Space align="baseline">
									{props.favorite && (
										<Button
											type={is_favorited ? "primary" : "default"}
											onClick={toggleCategoryPopup}
											icon={<IconStar />}
											shape="square"
										/>
									)}
									<Title
										level={5}
										style={{marginBottom: 0}}
									>
										{props.title}
									</Title>
								</Space>
								{props.subTitle && (
									<div>
										<Text type="secondary">{props.subTitle}</Text>
									</div>
								)}
							</div>
						</Space>
					</Col>
					<Col
						flex="auto"
						style={{ textAlign: "right" }}
						key={`col-` + 1}
					>
						<Space>{props.extra}</Space>
					</Col>
				</Row>
				{props.children && (
					<Row
						className="mt-1"
						key={`row-` + 1}
					>
						{React.Children.map(props.children, (child, index) => (
							<span
								key={index}
								className="page-actions_meta"
							>
								{child}
							</span>
						))}
					</Row>
				)}
			</div>
		</Skeleton>
	);
};

export default PageActions;

//=============================================================================
// Component Addon
//=============================================================================

// const PopupFavorite = ({ opened, toggle, data, reload }) => {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState(false);
//   const validationErrorsBag = useValidationErrors();

//   // Action Issue Materials
//   const handleSubmit = async (values) => {
//     setLoading(true);

//     const { status, error, validationErrors } = await updateLoInfo(data?.IDlot, values);
//     if (error) {
//       if (validationErrors) {
//         validationErrorsBag.setValidationErrors(validationErrors);
//         setLoading(false);
//       }
//       message.error("Error during updating operation");
//     } else {
//       message.success("Success updated");
//       toggle();
//       reload();
//     }
//   };

//   return (
//     <Modal
//       open={opened}
//       onCancel={toggle}
//       title={data ? `Update favorite link - ${data.name}` : "Create new favorite link"}
//       centered
//       destroyOnClose={true}
//       transitionName="ant-modal-slide-up"
//       footer={[
//         <Button icon={<IconTrash />} key={0} danger onClick={toggle}>
//           Delete
//         </Button>,
//         <Button key={1} type="primary" htmlType="submit" form="favorite-form">
//           Save
//         </Button>,
//       ]}
//     >
//       <Spin spinning={loading}>
//         <Form layout="vertical" name="favorite-form" form={form} onFinish={handleSubmit}>
//           <Form.Item
//             label="Name favorite"
//             name="name"
//             rules={[{ required: true }]}
//             {...validationErrorsBag.getInputErrors("name")}
//           >
//             <Input allowClear />
//           </Form.Item>
//         </Form>
//       </Spin>
//     </Modal>
//   );
// };
